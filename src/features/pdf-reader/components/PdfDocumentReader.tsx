import { useEffect, useState } from 'react';
import type { ClassifiedPdfTextSegment } from '../../../shared/types/reader';
import TranslationPanel from '../../translation/components/TranslationPanel';
import { useTranslationItems } from '../../translation/hooks/useTranslationItems';
import { pdfjsLib } from '../lib/pdfjsClient';
import PdfPageCanvas from './PdfPageCanvas';

interface PdfDocumentReaderProps {
  readonly file: File;
}

export default function PdfDocumentReader({
  file,
}: PdfDocumentReaderProps) {
  const [selectedSegment, setSelectedSegment] =
    useState<ClassifiedPdfTextSegment | null>(null);

  const [pagesCount, setPagesCount] = useState(0);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [pageInputValue, setPageInputValue] = useState('1');

  const {
    translationItems,
    addSegmentToTranslation,
    removeTranslationItem,
    clearTranslationItems,
  } = useTranslationItems();

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

        setPagesCount(pdfDocument.numPages);
        setCurrentPageNumber(1);
        setPageInputValue('1');
        setSelectedSegment(null);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error('[PdfDocumentReader] PDF info error:', error);

        setPagesCount(0);
        setCurrentPageNumber(1);
        setPageInputValue('1');
        setSelectedSegment(null);
      }
    };

    void loadPdfInfo();

    return () => {
      isCancelled = true;
    };
  }, [file]);

  const handleGoToPreviousPage = (): void => {
    setCurrentPageNumber((currentValue) => {
      const nextPageNumber = Math.max(currentValue - 1, 1);

      setPageInputValue(String(nextPageNumber));

      return nextPageNumber;
    });

    setSelectedSegment(null);
  };

  const handleGoToNextPage = (): void => {
    setCurrentPageNumber((currentValue) => {
      if (pagesCount === 0) {
        return currentValue;
      }

      const nextPageNumber = Math.min(currentValue + 1, pagesCount);

      setPageInputValue(String(nextPageNumber));

      return nextPageNumber;
    });

    setSelectedSegment(null);
  };

  const handleGoToPage = (): void => {
    const nextPageNumber = Number(pageInputValue);

    if (!Number.isInteger(nextPageNumber)) {
      setPageInputValue(String(currentPageNumber));
      return;
    }

    if (nextPageNumber < 1 || nextPageNumber > pagesCount) {
      setPageInputValue(String(currentPageNumber));
      return;
    }

    setCurrentPageNumber(nextPageNumber);
    setPageInputValue(String(nextPageNumber));
    setSelectedSegment(null);
  };

  const handleGoToPageSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ): void => {
    event.preventDefault();
    handleGoToPage();
  };

  return (
    <section className="pdf-document-reader">
      <header className="pdf-document-reader__header">
        <h1 className="pdf-document-reader__title">PDF Reader</h1>
      </header>

      <div className="pdf-document-reader__document-info">
        <span className="pdf-document-reader__page-info">
          Page {currentPageNumber}
          {pagesCount > 0 ? ` of ${pagesCount}` : ''}
        </span>

        <div className="pdf-document-reader__page-navigation">
          <button
            type="button"
            className="pdf-document-reader__page-button"
            onClick={handleGoToPreviousPage}
            disabled={currentPageNumber <= 1}
          >
            Previous page
          </button>

          <button
            type="button"
            className="pdf-document-reader__page-button"
            onClick={handleGoToNextPage}
            disabled={pagesCount === 0 || currentPageNumber >= pagesCount}
          >
            Next page
          </button>

          <form
            className="pdf-document-reader__go-to-page-form"
            onSubmit={handleGoToPageSubmit}
          >
            <label className="pdf-document-reader__go-to-page-label">
              <span className="pdf-document-reader__go-to-page-text">
                Go to page
              </span>

              <input
                type="number"
                className="pdf-document-reader__go-to-page-input"
                min={1}
                max={pagesCount || 1}
                value={pageInputValue}
                onChange={(event) => {
                  setPageInputValue(event.target.value);
                }}
              />
            </label>

            <button
              type="submit"
              className="pdf-document-reader__go-to-page-button"
              disabled={pagesCount === 0}
            >
              Go
            </button>
          </form>
        </div>
      </div>

      <div className="pdf-document-reader__toolbar">
        <button
          type="button"
          className="pdf-document-reader__add-translation-button"
          onClick={() => {
            addSegmentToTranslation(selectedSegment);
          }}
          disabled={!selectedSegment}
        >
          Add selected segment to translation
        </button>
      </div>

      <section className="pdf-document-reader__selected-segment">
        <h2 className="pdf-document-reader__selected-segment-title">
          Selected segment
        </h2>

        {!selectedSegment && (
          <p className="pdf-document-reader__selected-segment-empty">
            No segment selected.
          </p>
        )}

        {selectedSegment && (
          <article className="pdf-document-reader__selected-segment-card">
            <small className="pdf-document-reader__selected-segment-meta">
              {selectedSegment.type} · page {selectedSegment.pageNumber}
            </small>

            <p className="pdf-document-reader__selected-segment-text">
              {selectedSegment.text}
            </p>
          </article>
        )}
      </section>

      <div className="pdf-document-reader__content">
        <div className="pdf-document-reader__pages">
          <PdfPageCanvas
            file={file}
            pageNumber={currentPageNumber}
            selectedSegmentId={selectedSegment?.id ?? null}
            onSelectSegment={setSelectedSegment}
          />
        </div>

        <TranslationPanel
          items={translationItems}
          onRemoveItem={removeTranslationItem}
          onClearItems={clearTranslationItems}
        />
      </div>
    </section>
  );
}