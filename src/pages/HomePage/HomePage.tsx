import { useState } from 'react';
import PdfDocumentReader from '../../features/pdf-reader/components/PdfDocumentReader';
import PdfUploader from '../../features/pdf-upload/components/PdfUploader';

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File): void => {
    setSelectedFile(file);
  };

  return (
    <main className="home-page">
      <header className="home-page__header">
        <h1 className="home-page__title">DualRead AI</h1>
      </header>

      <section className="home-page__upload">
        <PdfUploader onFileSelect={handleFileSelect} />
      </section>

      {selectedFile && (
        <section className="home-page__reader">
          <PdfDocumentReader file={selectedFile} />
        </section>
      )}
    </main>
  );
}