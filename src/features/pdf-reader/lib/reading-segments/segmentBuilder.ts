import type {
  PdfReadingSegment,
  PdfTextLine,
  PdfTextToken,
  PdfTextWord,
} from '../../../../shared/types/reader';
import {
  buildRectsFromParts,
  getRectsBounds,
} from './segmentGeometry';
import type { SegmentTokenPart } from './segmentTokenParts';

const joinSegmentText = (
  segmentTokenParts: SegmentTokenPart[],
): string => {
  return segmentTokenParts
    .map((part) => {
      return part.text;
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const getUniqueLines = (
  segmentTokenParts: SegmentTokenPart[],
): PdfTextLine[] => {
  const linesMap = new Map<string, PdfTextLine>();

  segmentTokenParts.forEach((part) => {
    linesMap.set(part.line.id, part.line);
  });

  return Array.from(linesMap.values());
};

const getUniqueTokens = (
  segmentTokenParts: SegmentTokenPart[],
): PdfTextToken[] => {
  const tokensMap = new Map<number, PdfTextToken>();

  segmentTokenParts.forEach((part) => {
    tokensMap.set(part.token.orderIndex, part.token);
  });

  return Array.from(tokensMap.values());
};

const getWords = (
  segmentTokenParts: SegmentTokenPart[],
): PdfTextWord[] => {
  return segmentTokenParts.map((part) => {
    return {
      text: part.text,
      x: part.x,
      lineY: part.lineY,
      width: part.width,
      height: part.height,
    };
  });
};

export const buildSegment = (
  segmentTokenParts: SegmentTokenPart[],
  segmentIndex: number,
): PdfReadingSegment => {
  const firstPart = segmentTokenParts[0];

  const tokens = getUniqueTokens(segmentTokenParts);
  const lines = getUniqueLines(segmentTokenParts);
  const rects = buildRectsFromParts(segmentTokenParts);
  const words = getWords(segmentTokenParts);

  const bounds = getRectsBounds(rects);
  const text = joinSegmentText(segmentTokenParts);

  return {
    id: `page-${firstPart.token.pageNumber}-segment-${segmentIndex + 1}`,
    pageNumber: firstPart.token.pageNumber,
    text,

    lines,
    tokens,
    rects,
    words,

    x: bounds.x,
    lineY: bounds.lineY,
    width: bounds.right - bounds.x,
    height: bounds.bottom - bounds.lineY,

    charactersCount: text.length,
  };
};
