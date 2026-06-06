import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import type {
  PdfPageText,
  PdfTextLine,
} from '../../../shared/types/reader';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

interface TextToken {
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
}

const isTextItem = (item: unknown): item is TextItem => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'str' in item &&
    typeof (item as TextItem).str === 'string'
  );
};

const getFontSize = (item: TextItem): number => {
  const [, b, , d] = item.transform;

  return Math.round(Math.hypot(b, d) * 10) / 10;
};

const getTextToken = (item: TextItem): TextToken | null => {
  const text = item.str.trim();

  if (!text) {
    return null;
  }

  const [a, , , , x, y] = item.transform;
  const fontSize = getFontSize(item) || Math.abs(a);

  return {
    text,
    x,
    y,
    width: item.width,
    fontSize,
  };
};

const groupTokensIntoLines = (
  tokens: TextToken[],
  pageWidth: number,
  pageHeight: number,
): PdfTextLine[] => {
  const lineMap = new Map<number, TextToken[]>();

  for (const token of tokens) {
    const roundedY = Math.round(token.y);
    const currentLine = lineMap.get(roundedY) ?? [];

    currentLine.push(token);
    lineMap.set(roundedY, currentLine);
  }

  return Array.from(lineMap.entries())
    .map(([y, lineTokens]) => {
      const sortedTokens = [...lineTokens].sort((a, b) => a.x - b.x);

      const text = sortedTokens
        .map((token) => token.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      const x = Math.min(...sortedTokens.map((token) => token.x));

      const right = Math.max(
        ...sortedTokens.map((token) => token.x + token.width),
      );

      const width = right - x;

      const fontSize = Math.max(
        ...sortedTokens.map((token) => token.fontSize),
      );

      return {
        text,
        x,
        y,
        width,
        fontSize,
        pageWidth,
        pageHeight,
      };
    })
    .filter((line) => line.text.length > 0)
    .sort((a, b) => b.y - a.y);
};

const linesToPageText = (lines: PdfTextLine[]): string => {
  return lines
    .map((line) => line.text)
    .join('\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
};

export const extractPdfText = async (file: File): Promise<PdfPageText[]> => {
  const arrayBuffer = await file.arrayBuffer();

  const pdfDocument = await pdfjsLib.getDocument({
    data: arrayBuffer,
  }).promise;

  const pages: PdfPageText[] = [];

  for (let pageIndex = 1; pageIndex <= pdfDocument.numPages; pageIndex += 1) {
    const page = await pdfDocument.getPage(pageIndex);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();

    const tokens = textContent.items
      .filter(isTextItem)
      .map(getTextToken)
      .filter((token): token is TextToken => token !== null);

    const lines = groupTokensIntoLines(
      tokens,
      viewport.width,
      viewport.height,
    );

    const pageText = linesToPageText(lines);

    pages.push({
      pageNumber: pageIndex,
      text: pageText,
      lines,
      characterCount: pageText.length,
    });
  }

  return pages;
};