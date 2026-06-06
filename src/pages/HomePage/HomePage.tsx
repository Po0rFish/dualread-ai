import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PdfUploader } from '../../features/pdf-upload/components/PdfUploader';
import { extractPdfText } from '../../features/pdf-reader/lib/extractPdfText';
import { splitIntoReadingBlocks } from '../../features/pdf-reader/lib/splitIntoReadingBlocks';
import {
  documentsRepository,
  DocumentsLimitReachedError,
  MAX_STORED_DOCUMENTS,
  type ProcessedDocument,
} from '../../shared/repositories/documentsRepository';
import { createId } from '../../shared/utils/createId';
import type { DocumentInfo } from '../../shared/types/reader';

import './HomePage.scss';

export function HomePage() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(true);
  const [isReadingPdf, setIsReadingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const libraryLimitMessage = `Your local library is full. You can keep up to ${MAX_STORED_DOCUMENTS} books. Delete one book in Library before uploading a new one.`;

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
          setIsDocumentsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleContinueLastBook = () => {
    const lastDocument = documents[0];

    if (!lastDocument) {
      return;
    }

    navigate(`/reader/${lastDocument.documentInfo.id}`);
  };

  const handleFileSelect = async (file: File) => {
    setIsReadingPdf(true);
    setErrorMessage(null);

    try {
      const existingDocuments = await documentsRepository.getAll();

      if (existingDocuments.length >= MAX_STORED_DOCUMENTS) {
        setErrorMessage(libraryLimitMessage)
        return;
      }

      const documentId = createId();
      const pages = await extractPdfText(file);
      const blocks = splitIntoReadingBlocks(pages, documentId);

      if (blocks.length === 0) {
        setErrorMessage(
          'This PDF does not contain selectable text. Scanned PDFs are not supported yet.',
        );
        return;
      }

      const totalCharacters = pages.reduce(
        (sum, page) => sum + page.characterCount,
        0,
      );

      const documentInfo: DocumentInfo = {
        id: documentId,
        title: file.name.replace(/\.pdf$/i, ''),
        fileName: file.name,
        totalPages: pages.length,
        totalCharacters,
        createdAt: new Date().toISOString(),
      };

      await documentsRepository.set({
        documentInfo,
        blocks,
      });

      navigate(`/reader/${documentId}`);
    } catch (error) {
      console.error(error);

      if (error instanceof DocumentsLimitReachedError) {
        setErrorMessage(libraryLimitMessage);
        return;
      }

      setErrorMessage('Could not read this PDF file.');
    } finally {
      setIsReadingPdf(false);
    }
  };

  const documentsCount = documents.length;
  const isLibraryFull = documentsCount >= MAX_STORED_DOCUMENTS;
  const hasSavedDocuments = documentsCount > 0;

  return (
    <main className="home-page">
      <section className="home-page__hero">
        <p className="home-page__eyebrow">German PDF Reader</p>

        <h1 className="home-page__title">DualRead AI</h1>

        <p className="home-page__description">
          Read German PDF books comfortably. Reveal English translation only
          when you need it.
        </p>

        <div className="home-page__status">
          {isDocumentsLoading ? (
            <span>Checking local library...</span>
          ) : (
            <span>
              Saved books: {documentsCount} / {MAX_STORED_DOCUMENTS}
            </span>
          )}

          {isLibraryFull && (
            <p>
              Your local library is full. Delete one book before uploading a new
              PDF.
            </p>
          )}
        </div>

        <div className="home-page__actions">
          {isLibraryFull ? (
            <p className="home-page__upload-disabled">
              Library is full. Delete one book before uploading a new PDF.
            </p>
          ) : (
            <PdfUploader
              onFileSelect={handleFileSelect}
              isLoading={isReadingPdf}
            />
          )}

          {hasSavedDocuments && (
            <button
              type="button"
              className="home-page__secondary-button"
              onClick={handleContinueLastBook}
            >
              Continue last book
            </button>
          )}

          <Link to="/library" className="home-page__library-link">
            Open library
          </Link>
        </div>

        <p className="home-page__note">
          Text-based PDF only. Scanned PDFs are not supported yet.
        </p>

        {errorMessage && (
          <p className="home-page__error">
            {errorMessage}{' '}
            {isLibraryFull && <Link to="/library">Open Library</Link>}
          </p>
        )}
      </section>
    </main>
  );
}