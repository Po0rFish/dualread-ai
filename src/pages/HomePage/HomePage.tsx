import { lazy, Suspense, useState } from 'react';
import PdfUploader from '../../features/pdf-upload/components/PdfUploader';
import { useLibraryDocuments } from '../../features/library/hooks/useLibraryDocuments';
import AppHeader from '../../shared/components/AppHeader';
import './HomePage.scss';

const PdfDocumentReader = lazy(
  () => import('../../features/pdf-reader/components/PdfDocumentReader'),
);

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

        const { getPdfPagesCount } = await import(
          '../../features/pdf-reader/lib/getPdfPagesCount'
        );
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
      <AppHeader
        context={
          selectedDocumentFile?.file.name ??
          'PDF reader and translation workspace'
        }
      />

      {!selectedDocumentFile && (
        <div className="home-page__start">
          <header className="home-page__intro">
            <p className="home-page__eyebrow">Reading workspace</p>
            <h1 className="home-page__title">Open a document</h1>
            <p className="home-page__description">
              Upload a PDF to read, select text, and translate without leaving the page.
            </p>
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
        </div>
      )}

      {selectedDocumentFile && (
        <section className="home-page__reader">
          <Suspense fallback={<p className="home-page__message">Loading reader...</p>}>
            <PdfDocumentReader
              key={selectedDocumentFile.documentId}
              file={selectedDocumentFile.file}
              documentId={selectedDocumentFile.documentId}
            />
          </Suspense>
        </section>
      )}
    </main>
  );
}
