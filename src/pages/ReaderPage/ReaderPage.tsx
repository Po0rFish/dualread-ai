import { Link } from 'react-router-dom';
import './ReaderPage.scss';

export default function ReaderPage() {
  return (
    <main className="reader-page">
      <header className="reader-page__header">
        <div className="reader-page__header-content">
          <p className="reader-page__eyebrow">DualRead AI</p>
          <h1 className="reader-page__title">Reader</h1>
        </div>

        <Link to="/" className="reader-page__upload-link">
          Upload PDF
        </Link>
      </header>

      <section className="reader-page__empty">
        <h2 className="reader-page__empty-title">
          Saved document reader is not connected yet
        </h2>

        <p className="reader-page__empty-description">
          The current PDF reader works directly after upload on the home
          page. Opening saved documents by URL will be connected later with
          IndexedDB.
        </p>

        <Link to="/" className="reader-page__empty-link">
          Go to upload
        </Link>
      </section>
    </main>
  );
}