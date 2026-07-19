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

const splitTextIntoWords = (text: string): string[] => {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
};

export const splitTokenIntoParts = (
  token: PdfTextToken,
  line: PdfTextLine,
): SegmentTokenPart[] => {
  const words = splitTextIntoWords(token.text);

  if (words.length === 0) {
    return [];
  }

  const totalCharacters = words.reduce((total, word) => {
    return total + word.length;
  }, 0);

  let currentX = token.x;

  return words.map((word) => {
    const wordWidth =
      totalCharacters > 0
        ? token.width * (word.length / totalCharacters)
        : token.width / words.length;

    const part: SegmentTokenPart = {
      token,
      line,
      text: word,

      x: currentX,
      lineY: token.lineY,
      width: wordWidth,
      height: token.height,
      fontSize: token.fontSize,
    };

    currentX += wordWidth;

    return part;
  });
};