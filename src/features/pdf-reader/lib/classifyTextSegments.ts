import type {
  ClassifiedPdfTextSegment,
  PdfReadingSegment,
  PdfTextSegmentType,
} from '../../../shared/types/reader';

interface ClassifyTextSegmentsParams {
  readonly segments: PdfReadingSegment[];
  readonly pageHeight: number;
}

const TOP_PAGE_RATIO = 0.35;
const BOTTOM_PAGE_RATIO = 0.85;

const TITLE_MAX_INDEX = 3;
const SUBTITLE_MAX_INDEX = 5;

const SHORT_HEADING_MAX_LENGTH = 90;
const MIN_HEADING_FONT_SIZE_DIFFERENCE = 1;

const SENTENCE_END_REGEXP = /[.!?…][»“”")\]]?$/;

const isOnlyPageNumber = (text: string): boolean => {
  return /^\d+$/.test(text.trim());
};

const hasSentenceEnd = (text: string): boolean => {
  return SENTENCE_END_REGEXP.test(text.trim());
};

const isTechnicalNote = (text: string): boolean => {
  const normalizedText = text.trim().toLowerCase();

  return (
    normalizedText.startsWith('textauszug') ||
    normalizedText.startsWith('hinweis') ||
    normalizedText.startsWith('note')
  );
};

const getAverageValue = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((currentTotal, value) => {
    return currentTotal + value;
  }, 0);

  return total / values.length;
};

const getAverageFontSize = (segment: PdfReadingSegment): number => {
  return getAverageValue(
    segment.tokens.map((token) => {
      return token.fontSize;
    }),
  );
};

const getLargestFontSize = (segments: PdfReadingSegment[]): number => {
  if (segments.length === 0) {
    return 0;
  }

  return Math.max(
    ...segments.map((segment) => {
      return getAverageFontSize(segment);
    }),
  );
};

const getDominantFontSize = (
  segments: PdfReadingSegment[],
): number => {
  const fontSizeCounts = new Map<number, number>();

  segments.forEach((segment) => {
    const fontSize = Math.round(getAverageFontSize(segment));

    if (fontSize <= 0) {
      return;
    }

    fontSizeCounts.set(fontSize, (fontSizeCounts.get(fontSize) ?? 0) + 1);
  });

  let dominantFontSize = 0;
  let highestCount = 0;

  fontSizeCounts.forEach((count, fontSize) => {
    if (count > highestCount) {
      dominantFontSize = fontSize;
      highestCount = count;
    }
  });

  return dominantFontSize;
};

const isTopPageSegment = (
  segment: PdfReadingSegment,
  pageHeight: number,
): boolean => {
  return segment.lineY <= pageHeight * TOP_PAGE_RATIO;
};

const isBottomPageSegment = (
  segment: PdfReadingSegment,
  pageHeight: number,
): boolean => {
  return segment.lineY >= pageHeight * BOTTOM_PAGE_RATIO;
};

const isShortSingleLineSegment = (
  segment: PdfReadingSegment,
): boolean => {
  const text = segment.text.trim();

  return (
    segment.lines.length === 1 &&
    text.length > 0 &&
    text.length <= SHORT_HEADING_MAX_LENGTH
  );
};

const isHeadingLikeSegment = (
  segment: PdfReadingSegment,
  pageHeight: number,
): boolean => {
  const text = segment.text.trim();

  return (
    isTopPageSegment(segment, pageHeight) &&
    isShortSingleLineSegment(segment) &&
    !hasSentenceEnd(text)
  );
};

const isLargerThanBodyText = (
  segmentFontSize: number,
  dominantFontSize: number,
): boolean => {
  return (
    dominantFontSize > 0 &&
    segmentFontSize >=
      dominantFontSize + MIN_HEADING_FONT_SIZE_DIFFERENCE
  );
};

const classifySegment = (
  segment: PdfReadingSegment,
  segmentIndex: number,
  pageHeight: number,
  largestFontSize: number,
  dominantFontSize: number,
): PdfTextSegmentType => {
  const text = segment.text.trim();
  const averageFontSize = getAverageFontSize(segment);

  const isLargerThanBody = isLargerThanBodyText(
    averageFontSize,
    dominantFontSize,
  );

  if (isOnlyPageNumber(text)) {
    return 'pageNumber';
  }

  if (
    isTechnicalNote(text) ||
    isBottomPageSegment(segment, pageHeight)
  ) {
    return 'note';
  }

  if (
    segmentIndex <= TITLE_MAX_INDEX &&
    isHeadingLikeSegment(segment, pageHeight) &&
    averageFontSize >= largestFontSize - 1 &&
    isLargerThanBody
  ) {
    return 'title';
  }

  if (
    segmentIndex <= SUBTITLE_MAX_INDEX &&
    isHeadingLikeSegment(segment, pageHeight) &&
    isLargerThanBody
  ) {
    return 'subtitle';
  }

  if (text.length > 0) {
    return 'body';
  }

  return 'unknown';
};

export const classifyTextSegments = ({
  segments,
  pageHeight,
}: ClassifyTextSegmentsParams): ClassifiedPdfTextSegment[] => {
  const largestFontSize = getLargestFontSize(segments);
  const dominantFontSize = getDominantFontSize(segments);

  return segments.map((segment, segmentIndex) => {
    return {
      ...segment,
      type: classifySegment(
        segment,
        segmentIndex,
        pageHeight,
        largestFontSize,
        dominantFontSize,
      ),
    };
  });
};