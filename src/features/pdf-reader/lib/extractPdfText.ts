import type { PdfTextToken } from '../../../shared/types/reader';

interface PdfJsTextItem {
  readonly str: string;
  readonly transform: number[];
  readonly width: number;
  readonly height: number;
  readonly hasEOL: boolean;
}

interface ExtractPdfTextParams {
  readonly page: {
    getTextContent: () => Promise<{
      items: unknown[];
    }>;
  };
  readonly pageNumber: number;
  readonly pageHeight: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isPdfJsTextItem = (item: unknown): item is PdfJsTextItem => {
  if (!isRecord(item)) {
    return false;
  }

  return (
    typeof item.str === 'string' &&
    Array.isArray(item.transform) &&
    item.transform.length >= 6 &&
    item.transform.every((value) => {
      return typeof value === 'number';
    }) &&
    typeof item.width === 'number' &&
    typeof item.height === 'number' &&
    typeof item.hasEOL === 'boolean'
  );
};

const getTokenLineY = (
  item: PdfJsTextItem,
  pageHeight: number,
): number => {
  return pageHeight - item.transform[5];
};

const getFontSize = (item: PdfJsTextItem): number => {
  const scaleY = item.transform[3];

  if (scaleY !== 0) {
    return Math.abs(scaleY);
  }

  return item.height;
};

const createTextToken = (
  item: PdfJsTextItem,
  pageNumber: number,
  pageHeight: number,
  orderIndex: number,
): PdfTextToken | null => {
  const text = item.str.trim();

  if (!text) {
    return null;
  }

  return {
    text,
    pageNumber,
    orderIndex,

    x: item.transform[4],
    lineY: getTokenLineY(item, pageHeight),
    width: item.width,
    height: item.height,

    fontSize: getFontSize(item),
    hasEOL: item.hasEOL,
  };
};

export const extractPdfText = async ({
  page,
  pageNumber,
  pageHeight,
}: ExtractPdfTextParams): Promise<PdfTextToken[]> => {
  const textContent = await page.getTextContent();
  const textItems = textContent.items.filter(isPdfJsTextItem);

  return textItems
    .map((item, orderIndex) => {
      return createTextToken(
        item,
        pageNumber,
        pageHeight,
        orderIndex,
      );
    })
    .filter((token): token is PdfTextToken => {
      return token !== null;
    });
};