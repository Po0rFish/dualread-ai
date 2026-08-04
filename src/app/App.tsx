import { Route, Routes, BrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage';
import ReaderPage from '../pages/ReaderPage/ReaderPage';
import LibraryPage from '../pages/LibraryPage/LibraryPage';
import { TranslationCredentialsProvider } from '../features/translation/context/cred';

export default function App() {
  return (
    <TranslationCredentialsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reader/:documentId" element={<ReaderPage />} />
          <Route path="/library" element={<LibraryPage />} />
        </Routes>
      </BrowserRouter>
    </TranslationCredentialsProvider>
  );
}