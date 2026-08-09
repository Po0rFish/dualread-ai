import type { FormEvent } from 'react';

interface ReaderNavProps {
  readonly currentPageNumber: number;
  readonly pagesCount: number;
  readonly pageInputValue: string;
  readonly onPreviousPage: () => void;
  readonly onNextPage: () => void;
  readonly onPageInputChange: (value: string) => void;
  readonly onGoToPage: () => void;
}

export default function ReaderNav({
  currentPageNumber,
  pagesCount,
  pageInputValue,
  onPreviousPage,
  onNextPage,
  onPageInputChange,
  onGoToPage,
}: ReaderNavProps) {
  const handleGoToPageSubmit = (
    event: FormEvent<HTMLFormElement>,
  ): void => {
    event.preventDefault();
    onGoToPage();
  };

  return (
    <div className="pdf-document-reader__document-info">
      <span className="pdf-document-reader__page-info">
        Page {currentPageNumber}
        {pagesCount > 0 ? ` of ${pagesCount}` : ''}
      </span>

      <div className="pdf-document-reader__page-navigation">
        <button
          type="button"
          className="pdf-document-reader__page-button"
          aria-label="Previous page"
          title="Previous page"
          onClick={onPreviousPage}
          disabled={currentPageNumber <= 1}
        >
          ‹
        </button>

        <button
          type="button"
          className="pdf-document-reader__page-button"
          aria-label="Next page"
          title="Next page"
          onClick={onNextPage}
          disabled={pagesCount === 0 || currentPageNumber >= pagesCount}
        >
          ›
        </button>

        <form
          className="pdf-document-reader__go-to-page-form"
          onSubmit={handleGoToPageSubmit}
        >
          <label className="pdf-document-reader__go-to-page-label">
            <span className="pdf-document-reader__go-to-page-text">Page</span>

            <input
              type="number"
              className="pdf-document-reader__go-to-page-input"
              min={1}
              max={pagesCount || 1}
              value={pageInputValue}
              onChange={(event) => {
                onPageInputChange(event.target.value);
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
  );
}
