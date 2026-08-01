import type { PdfDocumentTextModel } from '../../types/documentText';
import { pdfjsLib } from '../pdfjsClient';
import { buildTextModel } from './buildTextModel';
import { getPageSegments } from './pageSegments';

interface ReadDocParams {
  readonly documentId: string;
  readonly file: File;
}

export const readDoc = async ({
  documentId,
  file,
}: ReadDocParams): Promise<PdfDocumentTextModel> => {
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
  });

  const pdfDocument = await loadingTask.promise;

  const pages = await Promise.all(
    Array.from({ length: pdfDocument.numPages }).map(
      async (_, pageIndex) => {
        const pageNumber = pageIndex + 1;
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({
          scale: 1,
        });
        const segments = await getPageSegments({
          page,
          pageNumber,
        });

        return {
          pageNumber,
          pageHeight: viewport.height,
          segments,
        };
      },
    ),
  );

  return buildTextModel({
    documentId,
    pages,
  });
};