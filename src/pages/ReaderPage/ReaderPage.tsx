import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { documentsRepository } from '../../features/library/repositories/documentRepository';
import type { LibraryDocument } from '../../features/library/types/library';
import PdfDocumentReader from '../../features/pdf-reader/components/PdfDocumentReader';
import './ReaderPage.scss';

const createFileFromLibraryDocument = (
  document: LibraryDocument,
): File => {
  return new File([document.fileBlob], document.fileName, {
    type: document.fileType || 'application/pdf',
    lastModified: new Date(document.lastOpenedAt).getTime(),
  });
};

export default function ReaderPage() {
  const { documentId } = useParams<{ documentId: string }>();

  const [readerFile, setReaderFile] = useState<File | null>(null);
  const [readerPageMessage, setReaderPageMessage] = useState<
    string | null
  >(null);
  const [isReaderPageLoading, setIsReaderPageLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadDocument = async (): Promise<void> => {
      try {
        setIsReaderPageLoading(true);
        setReaderPageMessage(null);
        setReaderFile(null);

        if (!documentId) {
          setReaderPageMessage('Document id is missing.');
          return;
        }

        const document = await documentsRepository.updateLastOpenedAt(
          documentId,
        );

        if (isCancelled) {
          return;
        }

        if (!document) {
          setReaderPageMessage('Document was not found.');
          return;
        }

        const file = createFileFromLibraryDocument(document);

        setReaderFile(file);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error('[ReaderPage] Open document error:', error);

        setReaderPageMessage(
          'Document could not be opened. Try uploading it again.',
        );
      } finally {
        if (!isCancelled) {
          setIsReaderPageLoading(false);
        }
      }
    };

    void loadDocument();

    return () => {
      isCancelled = true;
    };
  }, [documentId]);

  return (
    <main className="reader-page">
      <header className="reader-page__header">
        <div className="reader-page__header-content">
          <p className="reader-page__eyebrow">DualRead AI</p>
          <h1 className="reader-page__title">Reader</h1>
        </div>

        <Link to="/library" className="reader-page__upload-link">
          Library
        </Link>
      </header>

      {isReaderPageLoading && (
        <section className="reader-page__empty">
          <h2 className="reader-page__empty-title">Opening document</h2>

          <p className="reader-page__empty-description">
            Loading PDF from local library...
          </p>
        </section>
      )}

      {!isReaderPageLoading && readerPageMessage && (
        <section className="reader-page__empty">
          <h2 className="reader-page__empty-title">
            Could not open document
          </h2>

          <p className="reader-page__empty-description">
            {readerPageMessage}
          </p>

          <Link to="/library" className="reader-page__empty-link">
            Back to library
          </Link>
        </section>
      )}

      {!isReaderPageLoading && !readerPageMessage && !readerFile && (
        <section className="reader-page__empty">
          <h2 className="reader-page__empty-title">Reader is empty</h2>

          <p className="reader-page__empty-description">
            No PDF file is loaded yet.
          </p>

          <Link to="/library" className="reader-page__empty-link">
            Back to library
          </Link>
        </section>
      )}

      {!isReaderPageLoading && readerFile && (
        <section className="reader-page__reader">
          <PdfDocumentReader file={readerFile} />
        </section>
      )}
    </main>
  );
}