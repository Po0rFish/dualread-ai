import type { ClassifiedPdfTextSegment } from '../../../../shared/types/reader';
import { buildReadingSegments } from '../buildReadingSegments';
import { buildTextLines } from '../buildTextLines';
import { classifyTextSegments } from '../classifyTextSegments';
import { extractPdfText } from '../extractPdfText';

interface PdfPageLike {
  readonly getTextContent: () => Promise<{
    readonly items: unknown[];
  }>;

  readonly getViewport: (params: { readonly scale: number }) => {
    readonly height: number;
  };
}

interface GetPageSegmentsParams {
  readonly page: PdfPageLike;
  readonly pageNumber: number;
}

export const getPageSegments = async ({
  page,
  pageNumber,
}: GetPageSegmentsParams): Promise<ClassifiedPdfTextSegment[]> => {
  const viewport = page.getViewport({
    scale: 1,
  });

  const tokens = await extractPdfText({
    page,
    pageNumber,
    pageHeight: viewport.height,
  });

  const lines = buildTextLines(tokens);
  const segments = buildReadingSegments(lines);

  return classifyTextSegments({
    segments,
    pageHeight: viewport.height,
  });
};