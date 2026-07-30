import { getReadingProgress } from '../../../shared/storage/readingProgressStorage';
import type { PdfDocumentTextModel } from '../types/documentText';

export type TextModelStatus = 'idle' | 'loading' | 'ready' | 'error';

interface GetTextModelStatusParams {
  readonly textModel: PdfDocumentTextModel | null;
  readonly isTextModelLoading: boolean;
  readonly textModelError: string | null;
}

interface GetInitialPageNumberParams {
  readonly documentId?: string;
  readonly pagesCount: number;
}

export const getTextModelStatus = ({
  textModel,
  isTextModelLoading,
  textModelError,
}: GetTextModelStatusParams): TextModelStatus => {
  if (textModelError) {
    return 'error';
  }

  if (isTextModelLoading) {
    return 'loading';
  }

  if (textModel) {
    return 'ready';
  }

  return 'idle';
};

export const getInitialPageNumber = ({
  documentId,
  pagesCount,
}: GetInitialPageNumberParams): number => {
  if (!documentId) {
    return 1;
  }

  const savedProgress = getReadingProgress(documentId);
  const savedPageNumber = savedProgress?.pageNumber ?? 1;

  if (savedPageNumber < 1 || savedPageNumber > pagesCount) {
    return 1;
  }

  return savedPageNumber;
};