import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  documentsRepository,
  MAX_STORED_DOCUMENTS,
  type ProcessedDocument,
} from '../../shared/repositories/documentsRepository';
import { deleteDocumentBookmarks } from '../../shared/storage/bookmarksStorage';
import { deleteReadingProgress } from '../../shared/storage/readingProgressStorage';
import { savedWordsRepository } from '../../shared/repositories/savedWordsRepository';
import './LibraryPage.scss';
import { EmptyState } from '../../shared/components';

export function LibraryPage() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void documentsRepository
      .getAll()
      .then((storedDocuments) => {
        if (isMounted) {
          setDocuments(storedDocuments);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshDocuments = async () => {
    const storedDocuments = await documentsRepository.getAll();
    setDocuments(storedDocuments);
  };

  const handleOpenDocument = (documentId: string) => {
    navigate(`/reader/${documentId}`);
  };

  const handleDeleteDocument = async (documentId: string) => {
    const confirmed = globalThis.confirm(
      'Delete this book from your local library?',
    );

    if (!confirmed) {
      return;
    }

    await documentsRepository.delete(documentId);
    deleteDocumentBookmarks(documentId);
    deleteReadingProgress(documentId);
    await savedWordsRepository.deleteByDocumentId(documentId);

    await refreshDocuments();
  };

  const documentsCount = documents.length;
  const isLibraryFull = documentsCount >= MAX_STORED_DOCUMENTS;

  if (isLoading) {
    return (
      <main className="library-page">
        <EmptyState title="Loading library..." />
      </main>
    );
  }

  return (
    <main className="library-page">
      <header className="library-page__header">
        <div>
          <p className="library-page__eyebrow">DualRead AI</p>
          <h1 className="library-page__title">Library</h1>
        </div>

        <Link to="/" className="library-page__upload-link">
          Upload PDF
        </Link>
      </header>

      <section className="library-page__status">
        <strong>
          Saved books: {documentsCount} / {MAX_STORED_DOCUMENTS}
        </strong>

        {isLibraryFull && (
          <p>
            Your local library is full. Delete one book before uploading a new
            one.
          </p>
        )}
      </section>

      {documents.length === 0 ? (
        <EmptyState
          title="No saved books yet"
          description="Upload a German PDF to create your first reading document."
          action={<Link to="/">Upload PDF</Link>}
        />
      ) : (
        <section className="library-page__list">
          {documents.map((document) => (
            <article
              key={document.documentInfo.id}
              className="library-card"
            >
              <div>
                <h2 className="library-card__title">
                  {document.documentInfo.title}
                </h2>

                <p className="library-card__meta">
                  {document.documentInfo.totalPages} pages ·{' '}
                  {document.blocks.length} blocks ·{' '}
                  {document.documentInfo.totalCharacters.toLocaleString()}{' '}
                  characters
                </p>

                <p className="library-card__file">
                  {document.documentInfo.fileName}
                </p>
              </div>

              <div className="library-card__actions">
                <button
                  type="button"
                  onClick={() =>
                    handleOpenDocument(document.documentInfo.id)
                  }
                >
                  Open
                </button>

                <button
                  type="button"
                  className="library-card__delete"
                  onClick={() =>
                    handleDeleteDocument(document.documentInfo.id)
                  }
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}