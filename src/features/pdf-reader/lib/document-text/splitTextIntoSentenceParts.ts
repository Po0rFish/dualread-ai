import type { PdfSentencePart } from '../../types/documentText';

const SENTENCE_END_REGEXP = /[.!?…][»“”")\]]*$/;
const SENTENCE_FRAGMENT_REGEXP =
  /[^.!?…]+[.!?…][»“”")\]]*|[^.!?…]+$/g;

const PAGE_BOTTOM_START_RATIO = 0.72;
const PAGE_TOP_END_RATIO = 0.3;

const normalizeText = (text: string): string => {
  return text.replace(/\s+/g, ' ').trim();
};

const hasSentenceEnd = (text: string): boolean => {
  return SENTENCE_END_REGEXP.test(normalizeText(text));
};

const splitTextIntoFragments = (text: string): string[] => {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return [];
  }

  const fragments = normalizedText.match(SENTENCE_FRAGMENT_REGEXP);

  if (!fragments) {
    return [normalizedText];
  }

  return fragments
    .map((fragment) => {
      return normalizeText(fragment);
    })
    .filter((fragment) => {
      return fragment.length > 0;
    });
};

const getPageYRatio = (part: PdfSentencePart): number => {
  if (part.pageHeight <= 0) {
    return 0;
  }

  return part.lineY / part.pageHeight;
};

const isPartNearPageBottom = (part: PdfSentencePart): boolean => {
  return getPageYRatio(part) >= PAGE_BOTTOM_START_RATIO;
};

const isPartNearPageTop = (part: PdfSentencePart): boolean => {
  return getPageYRatio(part) <= PAGE_TOP_END_RATIO;
};

const canSegmentTypeContinueOnSamePage = (
  segmentType: PdfSentencePart['segmentType'],
): boolean => {
  return segmentType === 'body' || segmentType === 'note';
};

const canContinueSamePageSentence = (
  previousPart: PdfSentencePart,
  nextPart: PdfSentencePart,
): boolean => {
  if (previousPart.pageNumber !== nextPart.pageNumber) {
    return false;
  }

  if (previousPart.segmentType !== nextPart.segmentType) {
    return false;
  }

  return canSegmentTypeContinueOnSamePage(previousPart.segmentType);
};

const canContinueCrossPageSentence = (
  previousPart: PdfSentencePart,
  nextPart: PdfSentencePart,
): boolean => {
  const isNextPage = nextPart.pageNumber === previousPart.pageNumber + 1;

  if (!isNextPage) {
    return false;
  }

  if (
    previousPart.segmentType !== 'body' ||
    nextPart.segmentType !== 'body'
  ) {
    return false;
  }

  return isPartNearPageBottom(previousPart) && isPartNearPageTop(nextPart);
};

const canContinueSentence = (
  previousPart: PdfSentencePart,
  nextPart: PdfSentencePart,
): boolean => {
  return (
    canContinueSamePageSentence(previousPart, nextPart) ||
    canContinueCrossPageSentence(previousPart, nextPart)
  );
};

export const splitTextIntoSentenceParts = (
  parts: PdfSentencePart[],
): PdfSentencePart[][] => {
  const sentenceParts: PdfSentencePart[][] = [];
  let currentSentenceParts: PdfSentencePart[] = [];

  parts.forEach((part) => {
    if (currentSentenceParts.length > 0) {
      const previousPart =
        currentSentenceParts[currentSentenceParts.length - 1];

      if (!canContinueSentence(previousPart, part)) {
        sentenceParts.push(currentSentenceParts);
        currentSentenceParts = [];
      }
    }

    const fragments = splitTextIntoFragments(part.text);

    fragments.forEach((fragment) => {
      const nextPart: PdfSentencePart = {
        ...part,
        text: fragment,
      };

      currentSentenceParts.push(nextPart);

      if (hasSentenceEnd(fragment)) {
        sentenceParts.push(currentSentenceParts);
        currentSentenceParts = [];
      }
    });
  });

  if (currentSentenceParts.length > 0) {
    sentenceParts.push(currentSentenceParts);
  }

  return sentenceParts;
};