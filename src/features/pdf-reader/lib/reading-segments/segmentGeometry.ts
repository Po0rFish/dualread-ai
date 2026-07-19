import type { PdfTextRect } from '../../../../shared/types/reader';
import type { SegmentTokenPart } from './segmentTokenParts';

interface RectBounds {
  readonly x: number;
  readonly right: number;
  readonly lineY: number;
  readonly bottom: number;
}

const getPartsBounds = (
  parts: SegmentTokenPart[],
): RectBounds => {
  const x = Math.min(
    ...parts.map((part) => {
      return part.x;
    }),
  );

  const right = Math.max(
    ...parts.map((part) => {
      return part.x + part.width;
    }),
  );

  const lineY = Math.min(
    ...parts.map((part) => {
      return part.lineY;
    }),
  );

  const bottom = Math.max(
    ...parts.map((part) => {
      return part.lineY + part.height;
    }),
  );

  return {
    x,
    right,
    lineY,
    bottom,
  };
};

export const getRectsBounds = (
  rects: PdfTextRect[],
): RectBounds => {
  const x = Math.min(
    ...rects.map((rect) => {
      return rect.x;
    }),
  );

  const right = Math.max(
    ...rects.map((rect) => {
      return rect.x + rect.width;
    }),
  );

  const lineY = Math.min(
    ...rects.map((rect) => {
      return rect.lineY;
    }),
  );

  const bottom = Math.max(
    ...rects.map((rect) => {
      return rect.lineY + rect.height;
    }),
  );

  return {
    x,
    right,
    lineY,
    bottom,
  };
};

export const buildRectsFromParts = (
  segmentTokenParts: SegmentTokenPart[],
): PdfTextRect[] => {
  const partsByLineId = new Map<string, SegmentTokenPart[]>();

  segmentTokenParts.forEach((part) => {
    const lineParts = partsByLineId.get(part.line.id) ?? [];

    lineParts.push(part);
    partsByLineId.set(part.line.id, lineParts);
  });

  return Array.from(partsByLineId.values()).map((lineParts) => {
    const bounds = getPartsBounds(lineParts);

    return {
      x: bounds.x,
      lineY: bounds.lineY,
      width: bounds.right - bounds.x,
      height: bounds.bottom - bounds.lineY,
    };
  });
};