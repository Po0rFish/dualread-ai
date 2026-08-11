import type {
  PdfTextLine,
  PdfTextToken,
} from '../../../../shared/types/reader';

export interface SegmentTokenPart {
  readonly token: PdfTextToken;
  readonly line: PdfTextLine;
  readonly text: string;

  readonly x: number;
  readonly lineY: number;
  readonly width: number;
  readonly height: number;
  readonly fontSize: number;
}

const WORD_REGEXP = /\S+/g;
let measurementContext: CanvasRenderingContext2D | null = null;

const measureTextWidth = (text: string, token: PdfTextToken): number => {
  if (!measurementContext) {
    measurementContext = document.createElement('canvas').getContext('2d');
  }

  if (!measurementContext) {
    return text.length;
  }

  measurementContext.font = `${token.fontSize}px ${token.fontFamily ?? 'serif'}`;

  return measurementContext.measureText(text).width;
};

export const splitTokenIntoParts = (
  token: PdfTextToken,
  line: PdfTextLine,
): SegmentTokenPart[] => {
  const words = Array.from(token.text.matchAll(WORD_REGEXP));

  if (words.length === 0) {
    return [];
  }

  const measuredTokenWidth = measureTextWidth(token.text, token);
  const widthScale = measuredTokenWidth > 0
    ? token.width / measuredTokenWidth
    : token.width / token.text.length;

  return words.map((match) => {
    const word = match[0];
    const characterIndex = match.index ?? 0;
    const textBeforeWord = token.text.slice(0, characterIndex);
    const wordX = token.x + measureTextWidth(textBeforeWord, token) * widthScale;
    const wordWidth = Math.max(1, measureTextWidth(word, token) * widthScale);

    const part: SegmentTokenPart = {
      token,
      line,
      text: word,

      x: wordX,
      lineY: token.lineY,
      width: wordWidth,
      height: token.height,
      fontSize: token.fontSize,
    };

    return part;
  });
};
