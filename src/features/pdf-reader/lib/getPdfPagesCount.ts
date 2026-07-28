import { pdfjsLib } from './pdfjsClient';

export const getPdfPagesCount = async (
  file: File,
): Promise<number> => {
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
  });

  const pdfDocument = await loadingTask.promise;

  return pdfDocument.numPages;
};