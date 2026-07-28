import { Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage';
import ReaderPage from '../pages/ReaderPage/ReaderPage';
import LibraryPage from '../pages/LibraryPage/LibraryPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/reader/:documentId" element={<ReaderPage />} />
      <Route path="/library" element={<LibraryPage />} />
    </Routes>
  );
}