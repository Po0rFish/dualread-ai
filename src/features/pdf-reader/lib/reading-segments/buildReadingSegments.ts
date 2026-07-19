import type {
  PdfReadingSegment,
  PdfTextLine,
} from '../../../../shared/types/reader';
import { buildSegment } from './segmentBuilder';
import {
  splitTokenIntoParts,
  type SegmentTokenPart,
} from './segmentTokenParts';

const LOGICAL_SEGMENT_END_REGEXP = /[.!?…][»“”")\]]?$/;

const MAX_FONT_SIZE_DIFFERENCE = 1.2;
const MAX_LINE_DISTANCE_RATIO = 2.2;
const MAX_X_DIFFERENCE = 90;

const hasLogicalSegmentEnd = (text: string): boolean => {
  return LOGICAL_SEGMENT_END_REGEXP.test(text.trim());
};

const canContinueSegmentToLine = (
  previousLine: PdfTextLine,
  nextLine: PdfTextLine,
): boolean => {
  const fontSizeDifference = Math.abs(
    previousLine.fontSize - nextLine.fontSize,
  );

  const averageFontSize =
    (previousLine.fontSize + nextLine.fontSize) / 2;

  const lineDistance = Math.abs(
    nextLine.lineY - previousLine.lineY,
  );

  const xDifference = Math.abs(nextLine.x - previousLine.x);

  const isSimilarFontSize =
    fontSizeDifference <= MAX_FONT_SIZE_DIFFERENCE;

  const isCloseVertically =
    lineDistance <= averageFontSize * MAX_LINE_DISTANCE_RATIO;

  const isCloseHorizontally = xDifference <= MAX_X_DIFFERENCE;

  return (
    isSimilarFontSize &&
    isCloseVertically &&
    isCloseHorizontally
  );
};

const pushReadingSegment = (
  readingSegments: PdfReadingSegment[],
  segmentTokenParts: SegmentTokenPart[],
): void => {
  if (segmentTokenParts.length === 0) {
    return;
  }

  const readingSegment = buildSegment(
    segmentTokenParts,
    readingSegments.length,
  );

  readingSegments.push(readingSegment);
};

export const buildReadingSegments = (
  lines: PdfTextLine[],
): PdfReadingSegment[] => {
  const sortedLines = [...lines].sort((firstLine, secondLine) => {
    return firstLine.lineY - secondLine.lineY;
  });

  const readingSegments: PdfReadingSegment[] = [];
  let currentSegmentParts: SegmentTokenPart[] = [];
  let previousLine: PdfTextLine | null = null;

  sortedLines.forEach((line) => {
    if (
      previousLine !== null &&
      currentSegmentParts.length > 0 &&
      !canContinueSegmentToLine(previousLine, line)
    ) {
      pushReadingSegment(readingSegments, currentSegmentParts);
      currentSegmentParts = [];
    }

    line.tokens.forEach((token) => {
      const tokenParts = splitTokenIntoParts(token, line);

      tokenParts.forEach((part) => {
        currentSegmentParts.push(part);

        if (hasLogicalSegmentEnd(part.text)) {
          pushReadingSegment(readingSegments, currentSegmentParts);
          currentSegmentParts = [];
        }
      });
    });

    previousLine = line;
  });

  pushReadingSegment(readingSegments, currentSegmentParts);

  return readingSegments;
};