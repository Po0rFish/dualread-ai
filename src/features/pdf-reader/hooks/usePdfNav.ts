import { useCallback, useEffect, useState } from 'react';
import { setReadingProgress } from '../../../shared/storage/readingProgressStorage';
import { getInitialPageNumber } from '../lib/readerState';
import { pdfjsLib } from '../lib/pdfjsClient';

interface UsePdfNavParams {
  readonly file: File;
  readonly documentId?: string;
  readonly onPageChange?: () => void;
}

interface UsePdfNavResult {
  readonly pagesCount: number;
  readonly currentPageNumber: number;
  readonly pageInputValue: string;
  readonly setPageInputValue: (value: string) => void;
  readonly goToPreviousPage: () => void;
  readonly goToNextPage: () => void;
  readonly goToPage: () => void;
}

export const usePdfNav = ({
  file,
  documentId,
  onPageChange,
}: UsePdfNavParams): UsePdfNavResult => {
  const [pagesCount, setPagesCount] = useState(0);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [pageInputValue, setPageInputValue] = useState('1');

  const savePageProgress = useCallback(
    (pageNumber: number): void => {
      if (!documentId) {
        return;
      }

      setReadingProgress({
        documentId,
        pageNumber,
        updatedAt: new Date().toISOString(),
      });
    },
    [documentId],
  );

  const changePage = useCallback(
    (nextPageNumber: number): void => {
      setCurrentPageNumber(nextPageNumber);
      setPageInputValue(String(nextPageNumber));
      onPageChange?.();
      savePageProgress(nextPageNumber);
    },
    [onPageChange, savePageProgress],
  );

  useEffect(() => {
    let isCancelled = false;

    const loadPdfInfo = async (): Promise<void> => {
      try {
        const arrayBuffer = await file.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
        });

        const pdfDocument = await loadingTask.promise;

        if (isCancelled) {
          return;
        }

        const nextPageNumber = getInitialPageNumber({
          documentId,
          pagesCount: pdfDocument.numPages,
        });

        setPagesCount(pdfDocument.numPages);
        setCurrentPageNumber(nextPageNumber);
        setPageInputValue(String(nextPageNumber));
        onPageChange?.();
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error('[usePdfNav] PDF info error:', error);

        setPagesCount(0);
        setCurrentPageNumber(1);
        setPageInputValue('1');
        onPageChange?.();
      }
    };

    void loadPdfInfo();

    return () => {
      isCancelled = true;
    };
  }, [file, documentId, onPageChange]);

  const goToPreviousPage = useCallback((): void => {
    const nextPageNumber = Math.max(currentPageNumber - 1, 1);

    changePage(nextPageNumber);
  }, [changePage, currentPageNumber]);

  const goToNextPage = useCallback((): void => {
    if (pagesCount === 0) {
      return;
    }

    const nextPageNumber = Math.min(currentPageNumber + 1, pagesCount);

    changePage(nextPageNumber);
  }, [changePage, currentPageNumber, pagesCount]);

  const goToPage = useCallback((): void => {
    const nextPageNumber = Number(pageInputValue);

    if (!Number.isInteger(nextPageNumber)) {
      setPageInputValue(String(currentPageNumber));
      return;
    }

    if (nextPageNumber < 1 || nextPageNumber > pagesCount) {
      setPageInputValue(String(currentPageNumber));
      return;
    }

    changePage(nextPageNumber);
  }, [changePage, currentPageNumber, pageInputValue, pagesCount]);

  return {
    pagesCount,
    currentPageNumber,
    pageInputValue,
    setPageInputValue,
    goToPreviousPage,
    goToNextPage,
    goToPage,
  };
};