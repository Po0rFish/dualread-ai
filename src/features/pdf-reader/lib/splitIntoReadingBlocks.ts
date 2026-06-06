import type {
  PdfPageText,
  PdfTextLine,
  ReadingBlock,
  ReadingBlockType,
} from '../../../shared/types/reader';

const MIN_BLOCK_LENGTH = 20;
const MAX_BLOCK_LENGTH = 600;
const TITLE_MAX_LENGTH = 160;
const SUBTITLE_MAX_LENGTH = 180;
const NOTE_MAX_LENGTH = 220;

const TOP_PAGE_RATIO = 0.4;
const CENTER_TOLERANCE_RATIO = 0.12;
const MIN_TITLE_FONT_DIFFERENCE = 1.5;

interface DraftBlock {
  text: string;
  type: ReadingBlockType;
  firstLineY: number;
}

const normalizeText = (text: string): string =>
  text.replace(/\s+/g, ' ').trim();

const roundFont = (fontSize: number): number =>
  Math.round(fontSize * 10) / 10;

const isProbablyPageNumber = (text: string): boolean =>
  /^\d+$/.test(text.trim());

const isValidTextLine = (text: string): boolean =>
  Boolean(text) && !isProbablyPageNumber(text);

const splitLongTextIntoSentences = (text: string): string[] =>
  text
    .split(/(?<=[.!?…])\s+/)
    .map(normalizeText)
    .filter(Boolean);

const isLineInTopArea = (line: PdfTextLine): boolean =>
  line.pageHeight - line.y <= line.pageHeight * TOP_PAGE_RATIO;

const isCenteredLine = (line: PdfTextLine): boolean => {
  const pageCenter = line.pageWidth / 2;
  const lineCenter = line.x + line.width / 2;

  return (
    Math.abs(pageCenter - lineCenter) <=
    line.pageWidth * CENTER_TOLERANCE_RATIO
  );
};

const looksLikeBodySentence = (text: string): boolean => {
  const normalizedText = normalizeText(text);

  return (
    normalizedText.length > SUBTITLE_MAX_LENGTH ||
    (normalizedText.length > 70 && /[.!?…]$/.test(normalizedText))
  );
};

const hasNoteKeyword = (text: string): boolean =>
  /^(hinweis|note|anmerkung|bemerkung|achtung|info)\s*:/i.test(
    normalizeText(text),
  );

const hasHeadingKeyword = (text: string): boolean =>
  /^(kapitel|vorr?ede|abschnitt|teil|buch|chapter|preface)\b/i.test(
    normalizeText(text),
  );

const isValidHeadingText = (text: string, maxLength: number): boolean =>
  isValidTextLine(text) &&
  text.length <= maxLength &&
  !looksLikeBodySentence(text);

const getDominantFontSize = (lines: PdfTextLine[]): number => {
  const sizes = new Map<number, number>();

  lines.forEach((line) => {
    const size = Math.round(line.fontSize);
    sizes.set(size, (sizes.get(size) ?? 0) + 1);
  });

  return [...sizes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;
};

const getTopLines = (lines: PdfTextLine[]): PdfTextLine[] =>
  lines.filter((line) => {
    const text = normalizeText(line.text);
    return isValidTextLine(text) && isLineInTopArea(line);
  });

const isTitleCandidate = (
  line: PdfTextLine,
  maxTopFontSize: number,
  dominantFontSize: number,
): boolean => {
  const text = normalizeText(line.text);
  const fontSize = roundFont(line.fontSize);

  if (!isValidHeadingText(text, TITLE_MAX_LENGTH)) {
    return false;
  }

  const hasLargestFont = fontSize >= maxTopFontSize - 0.5;
  const isBiggerThanBody =
    fontSize >= dominantFontSize + MIN_TITLE_FONT_DIFFERENCE;

  return (
    (hasLargestFont && isBiggerThanBody) ||
    (hasHeadingKeyword(text) && isCenteredLine(line))
  );
};

const findTitleLine = (
  lines: PdfTextLine[],
  dominantFontSize: number,
): PdfTextLine | null => {
  const topLines = getTopLines(lines);

  if (topLines.length === 0) {
    return null;
  }

  const maxTopFontSize = Math.max(
    ...topLines.map((line) => roundFont(line.fontSize)),
  );

  return (
    topLines
      .filter((line) =>
        isTitleCandidate(line, maxTopFontSize, dominantFontSize),
      )
      .sort((a, b) => {
        const centeredDiff =
          Number(isCenteredLine(b)) - Number(isCenteredLine(a));

        return centeredDiff || b.y - a.y;
      })[0] ?? null
  );
};

const isSubtitleCandidate = (
  line: PdfTextLine,
  dominantFontSize: number,
): boolean => {
  const text = normalizeText(line.text);
  const fontSize = roundFont(line.fontSize);

  if (!isValidHeadingText(text, SUBTITLE_MAX_LENGTH)) {
    return false;
  }

  if (!isLineInTopArea(line)) {
    return false;
  }

  const isDifferentFromBody = Math.abs(fontSize - dominantFontSize) >= 0.5;

  return isCenteredLine(line) || isDifferentFromBody;
};

const findSubtitleLine = (
  lines: PdfTextLine[],
  titleLine: PdfTextLine | null,
  dominantFontSize: number,
): PdfTextLine | null => {
  if (!titleLine) {
    return null;
  }

  const titleIndex = lines.indexOf(titleLine);

  if (titleIndex === -1) {
    return null;
  }

  return (
    lines
      .slice(titleIndex + 1, titleIndex + 3)
      .find((line) => isSubtitleCandidate(line, dominantFontSize)) ?? null
  );
};

const isLikelyNoteLine = (
  line: PdfTextLine,
  dominantFontSize: number,
): boolean => {
  const text = normalizeText(line.text);
  const isSmallerThanBody = roundFont(line.fontSize) < dominantFontSize;

  return (
    isValidTextLine(text) &&
    (hasNoteKeyword(text) ||
      (isSmallerThanBody && text.length <= NOTE_MAX_LENGTH))
  );
};

const getMedianLineGap = (lines: PdfTextLine[]): number => {
  const gaps = lines
    .slice(0, -1)
    .map((line, index) => Math.abs(line.y - lines[index + 1].y))
    .filter(Boolean)
    .sort((a, b) => a - b);

  return gaps[Math.floor(gaps.length / 2)] ?? 0;
};

const isNewParagraph = (
  previousLine: PdfTextLine,
  currentLine: PdfTextLine,
  medianLineGap: number,
): boolean => {
  const verticalGap = Math.abs(previousLine.y - currentLine.y);
  const leftIndentDifference = Math.abs(currentLine.x - previousLine.x);

  const hasLargeVerticalGap =
    medianLineGap > 0 && verticalGap >= medianLineGap * 1.55;

  const previousEndsSentence = /[.!?…:;]$/.test(previousLine.text.trim());

  const hasNewLeftIndent = leftIndentDifference >= currentLine.fontSize * 1.5;

  return hasLargeVerticalGap || (previousEndsSentence && hasNewLeftIndent);
};

const groupLinesIntoParagraphs = (
  lines: PdfTextLine[],
): PdfTextLine[][] => {
  if (lines.length === 0) {
    return [];
  }

  const medianLineGap = getMedianLineGap(lines);

  return lines.reduce<PdfTextLine[][]>((paragraphs, line, index) => {
    if (index === 0) {
      return [[line]];
    }

    const previousLine = lines[index - 1];
    const lastParagraph = paragraphs[paragraphs.length - 1];

    if (isNewParagraph(previousLine, line, medianLineGap)) {
      paragraphs.push([line]);
    } else {
      lastParagraph.push(line);
    }

    return paragraphs;
  }, []);
};

const createDraftBlock = (
  line: PdfTextLine,
  type: ReadingBlockType,
): DraftBlock => ({
  text: line.text,
  type,
  firstLineY: line.y,
});

const createDraftParagraphBlocks = (
  paragraphLines: PdfTextLine[],
): DraftBlock[] => {
  const paragraphText = normalizeText(
    paragraphLines.map((line) => line.text).join(' '),
  );

  if (paragraphText.length < MIN_BLOCK_LENGTH) {
    return [];
  }

  const firstLineY = paragraphLines[0].y;

  if (paragraphText.length <= MAX_BLOCK_LENGTH) {
    return [
      {
        text: paragraphText,
        type: 'paragraph',
        firstLineY,
      },
    ];
  }

  return splitLongTextIntoSentences(paragraphText)
    .filter((sentence) => sentence.length >= MIN_BLOCK_LENGTH)
    .map((sentence) => ({
      text: sentence,
      type: 'paragraph',
      firstLineY,
    }));
};

const createBlock = ({
  documentId,
  pageNumber,
  text,
  index,
  type,
}: {
  documentId: string;
  pageNumber: number;
  text: string;
  index: number;
  type: ReadingBlockType;
}): ReadingBlock => {
  const normalizedText = normalizeText(text);

  return {
    id: `${documentId}-page-${pageNumber}-block-${index + 1}`,
    documentId,
    pageNumber,
    originalText: normalizedText,
    translatedText: undefined,
    isTranslationVisible: false,
    isTranslated: false,
    characterCount: normalizedText.length,
    type,
  };
};

const splitPageTextIntoBlocks = (
  page: PdfPageText,
): Array<{
  text: string;
  type: ReadingBlockType;
}> => {
  const lines = page.lines.filter((line) => normalizeText(line.text));

  if (lines.length === 0) {
    return [];
  }

  const dominantFontSize = getDominantFontSize(lines);
  const titleLine = findTitleLine(lines, dominantFontSize);
  const subtitleLine = findSubtitleLine(
    lines,
    titleLine,
    dominantFontSize,
  );

  const usedLines = new Set<PdfTextLine>();
  const draftBlocks: DraftBlock[] = [];

  [titleLine, subtitleLine].forEach((line, index) => {
    if (!line) {
      return;
    }

    const type: ReadingBlockType = index === 0 ? 'title' : 'subtitle';

    usedLines.add(line);
    draftBlocks.push(createDraftBlock(line, type));
  });

  lines
    .filter((line) => !usedLines.has(line))
    .filter((line) => isLikelyNoteLine(line, dominantFontSize))
    .forEach((line) => {
      usedLines.add(line);
      draftBlocks.push(createDraftBlock(line, 'note'));
    });

  const bodyLines = lines.filter((line) => !usedLines.has(line));

  groupLinesIntoParagraphs(bodyLines).forEach((paragraphLines) => {
    draftBlocks.push(...createDraftParagraphBlocks(paragraphLines));
  });

  return draftBlocks
    .sort((a, b) => b.firstLineY - a.firstLineY)
    .map(({ text, type }) => ({
      text,
      type,
    }));
};

export const splitIntoReadingBlocks = (
  pages: PdfPageText[],
  documentId: string,
): ReadingBlock[] =>
  pages.flatMap((page) =>
    splitPageTextIntoBlocks(page).map((block, index) =>
      createBlock({
        documentId,
        pageNumber: page.pageNumber,
        text: block.text,
        index,
        type: block.type,
      }),
    ),
  );