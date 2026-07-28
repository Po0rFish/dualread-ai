import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLibraryDocuments } from '../../features/library/hooks/useLibraryDocuments';
import { getReadingProgress } from '../../shared/storage/readingProgressStorage';
import './LibraryPage.scss';

const formatFileSize = (fileSize: number): string => {
  const megabytes = fileSize / 1024 / 1024;

  return `${megabytes.toFixed(2)} MB`;
};

const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
};

const getLastReadPageText = (
  documentId: string,
  pagesCount: number,
): string => {
  const progress = getReadingProgress(documentId);

  if (!progress) {
    return 'Not started yet';
  }

  if (progress.pageNumber < 1 || progress.pageNumber > pagesCount) {
    return 'Not started yet';
  }

  return `Last read page: ${progress.pageNumber} of ${pagesCount}`;
};

export default function LibraryPage() {
  const {
    documents,
    libraryMessage,
    isLibraryLoading,
    loadDocuments,
    deleteDocument,
  } = useLibraryDocuments();

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  return (
    <main className="library-page">
      <header className="library-page__header">
        <div className="library-page__header-content">
          <p className="library-page__eyebrow">DualRead AI</p>
          <h1 className="library-page__title">Library</h1>
        </div>

        <Link to="/" className="library-page__upload-link">
          Upload PDF
        </Link>
      </header>

      <section className="library-page__content">
        {isLibraryLoading && (
          <p className="library-page__message">Loading library...</p>
        )}

        {libraryMessage && (
          <p className="library-page__message">{libraryMessage}</p>
        )}

        {!isLibraryLoading && documents.length === 0 && (
          <div className="library-page__empty">
            <h2 className="library-page__empty-title">
              Local library is empty
            </h2>

            <p className="library-page__empty-description">
              Upload a PDF file to save it in the local browser library.
            </p>

            <Link to="/" className="library-page__empty-link">
              Go to upload
            </Link>
          </div>
        )}

        {documents.length > 0 && (
          <div className="library-page__documents">
            {documents.map((document) => {
              return (
                <article
                  key={document.id}
                  className="library-page__document-card"
                >
                  <div className="library-page__document-main">
                    <h2 className="library-page__document-title">
                      {document.fileName}
                    </h2>

                    <p className="library-page__document-meta">
                      {document.pagesCount} pages ·{' '}
                      {formatFileSize(document.fileSize)}
                    </p>

                    <p className="library-page__document-meta">
                      {getLastReadPageText(
                        document.id,
                        document.pagesCount,
                      )}
                    </p>

                    <p className="library-page__document-meta">
                      Last opened: {formatDate(document.lastOpenedAt)}
                    </p>
                  </div>

                  <div className="library-page__document-actions">
                    <Link
                      to={`/reader/${document.id}`}
                      className="library-page__document-open-link"
                    >
                      Open
                    </Link>

                    <button
                      type="button"
                      className="library-page__document-delete-button"
                      onClick={() => {
                        void deleteDocument(document.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}