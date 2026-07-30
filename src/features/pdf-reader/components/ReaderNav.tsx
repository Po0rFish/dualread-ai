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
          onClick={onPreviousPage}
          disabled={currentPageNumber <= 1}
        >
          Previous page
        </button>

        <button
          type="button"
          className="pdf-document-reader__page-button"
          onClick={onNextPage}
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