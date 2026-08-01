import { useState } from 'react';
import { Link } from 'react-router-dom';
import PdfDocumentReader from '../../features/pdf-reader/components/PdfDocumentReader';
import { getPdfPagesCount } from '../../features/pdf-reader/lib/getPdfPagesCount';
import PdfUploader from '../../features/pdf-upload/components/PdfUploader';
import { useLibraryDocuments } from '../../features/library/hooks/useLibraryDocuments';
import './HomePage.scss';

interface SelectedDocumentFile {
  readonly file: File;
  readonly documentId: string;
}

export default function HomePage() {
  const [selectedDocumentFile, setSelectedDocumentFile] =
    useState<SelectedDocumentFile | null>(null);
  const [homePageMessage, setHomePageMessage] = useState<string | null>(
    null,
  );

  const { libraryMessage, isLibraryLoading, saveDocument } =
    useLibraryDocuments();

  const handleFileSelect = (file: File): void => {
    const saveSelectedFile = async (): Promise<void> => {
      try {
        setHomePageMessage(null);

        const pagesCount = await getPdfPagesCount(file);

        const savedDocument = await saveDocument({
          file,
          pagesCount,
        });

        if (!savedDocument) {
          return;
        }

        setHomePageMessage('PDF saved to library.');
        setSelectedDocumentFile({
          file,
          documentId: savedDocument.id,
        });
      } catch (error) {
        console.error('[HomePage] PDF upload error:', error);

        setHomePageMessage(
          'PDF could not be saved. You can try another file.',
        );
      }
    };

    void saveSelectedFile();
  };

  return (
    <main className="home-page">
      <header className="home-page__header">
        <h1 className="home-page__title">DualRead AI</h1>

        <Link to="/library" className="home-page__library-link">
          Library
        </Link>
      </header>

      <section className="home-page__upload">
        <PdfUploader onFileSelect={handleFileSelect} />

        {isLibraryLoading && (
          <p className="home-page__message">Saving PDF...</p>
        )}

        {libraryMessage && (
          <p className="home-page__message">{libraryMessage}</p>
        )}

        {homePageMessage && (
          <p className="home-page__message">{homePageMessage}</p>
        )}
      </section>

      {selectedDocumentFile && (
        <section className="home-page__reader">
          <PdfDocumentReader
            key={selectedDocumentFile.documentId}
            file={selectedDocumentFile.file}
            documentId={selectedDocumentFile.documentId}
          />
        </section>
      )}
    </main>
  );
}