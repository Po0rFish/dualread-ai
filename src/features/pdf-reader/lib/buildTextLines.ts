import type {
  PdfTextLine,
  PdfTextToken,
} from '../../../shared/types/reader';

const TOKEN_X_TOLERANCE = 1;

const getLineYKey = (lineY: number): string => {
  return lineY.toFixed(1);
};

const sortTokensInLine = (
  firstToken: PdfTextToken,
  secondToken: PdfTextToken,
): number => {
  const xDifference = firstToken.x - secondToken.x;

  if (Math.abs(xDifference) > TOKEN_X_TOLERANCE) {
    return xDifference;
  }

  return firstToken.orderIndex - secondToken.orderIndex;
};

const getAverageValue = (
  values: number[],
): number => {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((currentTotal, value) => {
    return currentTotal + value;
  }, 0);

  return total / values.length;
};

const joinLineText = (tokens: PdfTextToken[]): string => {
  return tokens
    .map((token) => {
      return token.text;
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const buildLineFromTokens = (
  tokens: PdfTextToken[],
  lineIndex: number,
): PdfTextLine => {
  const sortedTokens = [...tokens].sort(sortTokensInLine);
  const firstToken = sortedTokens[0];

  const x = Math.min(
    ...sortedTokens.map((token) => {
      return token.x;
    }),
  );

  const right = Math.max(
    ...sortedTokens.map((token) => {
      return token.x + token.width;
    }),
  );

  const lineY = getAverageValue(
    sortedTokens.map((token) => {
      return token.lineY;
    }),
  );

  const bottom = Math.max(
    ...sortedTokens.map((token) => {
      return token.lineY + token.height;
    }),
  );

  const fontSize = getAverageValue(
    sortedTokens.map((token) => {
      return token.fontSize;
    }),
  );

  return {
    id: `page-${firstToken.pageNumber}-line-${lineIndex + 1}`,
    pageNumber: firstToken.pageNumber,
    text: joinLineText(sortedTokens),
    tokens: sortedTokens,

    x,
    lineY,
    width: right - x,
    height: bottom - lineY,

    fontSize,
  };
};

export const buildTextLines = (
  tokens: PdfTextToken[],
): PdfTextLine[] => {
  const linesMap = new Map<string, PdfTextToken[]>();

  tokens.forEach((token) => {
    const lineYKey = getLineYKey(token.lineY);
    const lineTokens = linesMap.get(lineYKey) ?? [];

    lineTokens.push(token);
    linesMap.set(lineYKey, lineTokens);
  });

  return Array.from(linesMap.values())
    .map((lineTokens, lineIndex) => {
      return buildLineFromTokens(lineTokens, lineIndex);
    })
    .sort((firstLine, secondLine) => {
      return firstLine.lineY - secondLine.lineY;
    });
};