import { Link } from 'react-router-dom';
import { ToolbarButton } from '../../../shared/components';
import type { ReaderSettings } from '../../../shared/types/reader';
import type { ReadingProgress } from '../../../shared/storage/readingProgressStorage';

interface ReaderToolbarProps {
  readonly theme: ReaderSettings['theme'];
  readonly bookmarksCount: number;
  readonly savedWordsCount: number;
  readonly readingProgress: ReadingProgress | null;
  readonly onDecreaseFontSize: () => void;
  readonly onIncreaseFontSize: () => void;
  readonly onThemeChange: (theme: ReaderSettings['theme']) => void;
  readonly onOpenBookmarks: () => void;
  readonly onOpenSavedWords: () => void;
  readonly onContinueReading: () => void;
}

export function ReaderToolbar({
  theme,
  bookmarksCount,
  savedWordsCount,
  readingProgress,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onThemeChange,
  onOpenBookmarks,
  onOpenSavedWords,
  onContinueReading,
}: ReaderToolbarProps) {
  return (
    <section className="reader-page__toolbar">
      <ToolbarButton onClick={onDecreaseFontSize}>
        A-
      </ToolbarButton>

      <ToolbarButton onClick={onIncreaseFontSize}>
        A+
      </ToolbarButton>

      <ToolbarButton
        active={theme === 'light'}
        onClick={() => onThemeChange('light')}
      >
        Light
      </ToolbarButton>

      <ToolbarButton
        active={theme === 'sepia'}
        onClick={() => onThemeChange('sepia')}
      >
        Sepia
      </ToolbarButton>

      <ToolbarButton
        active={theme === 'dark'}
        onClick={() => onThemeChange('dark')}
      >
        Dark
      </ToolbarButton>

      <ToolbarButton onClick={onOpenBookmarks}>
        Bookmarks ({bookmarksCount})
      </ToolbarButton>

      <ToolbarButton onClick={onOpenSavedWords}>
        Words ({savedWordsCount})
      </ToolbarButton>

      <ToolbarButton
        onClick={onContinueReading}
        disabled={!readingProgress}
      >
        Continue reading
        {readingProgress ? ` · Page ${readingProgress.pageNumber}` : ''}
      </ToolbarButton>

      <Link to="/library" className="reader-page__toolbar-link">
        Library
      </Link>
    </section>
  );
}