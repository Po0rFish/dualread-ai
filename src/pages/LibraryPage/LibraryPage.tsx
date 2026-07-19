import { Link } from 'react-router-dom';
import './LibraryPage.scss';

export default function LibraryPage() {
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

      <section className="library-page__empty">
        <h2 className="library-page__empty-title">
          Local library is not connected yet
        </h2>

        <p className="library-page__empty-description">
          PDF upload and reading already work on the home page. Local
          document storage will be connected later with IndexedDB.
        </p>

        <Link to="/" className="library-page__empty-link">
          Go to upload
        </Link>
      </section>
    </main>
  );
}