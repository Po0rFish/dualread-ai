import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookmarksPanel } from '../../features/bookmarks/components/BookmarksPanel';
import { useBookmarks } from '../../features/bookmarks/hooks/useBookmarks';
import { ReadingBlockCard } from '../../features/reader/components/ReadingBlockCard';
import {
  documentsRepository,
  type ProcessedDocument,
} from '../../shared/repositories/documentsRepository';
import {
  getReaderSettings,
  setReaderSettings,
} from '../../shared/storage/readerSettingsStorage';
import {
  getReadingProgress,
  setReadingProgress,
} from '../../shared/storage/readingProgressStorage';
import type {
  ReaderSettings,
  ReadingBlock,
} from '../../shared/types/reader';

import './ReaderPage.scss';
import { ReaderToolbar } from '../../features/reader/components/ReaderToolbar';
import { EmptyState } from '../../shared/components';

const MIN_FONT_SIZE = 16;
const MAX_FONT_SIZE = 30;
const FONT_STEP = 2;

export function ReaderPage() {
  const { documentId } = useParams<{ documentId: string }>();

  const [readerSettingsState, setReaderSettingsState] = useState<ReaderSettings>(() =>
    getReaderSettings(),
  );

  const [processedDocumentState, setProcessedDocumentState] =
    useState<ProcessedDocument | null>(null);

  const [isDocumentLoading, setIsDocumentLoading] = useState(true);
  const [isBookmarksPanelOpen, setIsBookmarksPanelOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadDocument = async () => {
      if (!documentId) {
        setIsDocumentLoading(false);
        return;
      }

      setIsDocumentLoading(true);

      try {
        const document = await documentsRepository.get(documentId);

        if (isMounted) {
          setProcessedDocumentState(document);
        }
      } finally {
        if (isMounted) {
          setIsDocumentLoading(false);
        }
      }
    };

    void loadDocument();

    return () => {
      isMounted = false;
    };
  }, [documentId]);

  const documentInfo = processedDocumentState?.documentInfo;

  const blocks = useMemo(() => {
    return processedDocumentState?.blocks ?? [];
  }, [processedDocumentState?.blocks]);

  const {
    bookmarks,
    isBookmarked,
    bookmarkMessage,
    toggleBookmark,
  } = useBookmarks(documentId ?? '');

  const readingProgress = useMemo(() => {
    if (!documentId) {
      return null;
    }

    return getReadingProgress(documentId);
  }, [documentId]);

  const totalBlocks = blocks.length;

  const totalCharacters = useMemo(() => {
    return blocks.reduce((sum, block) => sum + block.characterCount, 0);
  }, [blocks]);

  const updateSettings = (nextSettings: ReaderSettings) => {
    setReaderSettingsState(nextSettings);
    setReaderSettings(nextSettings);
  };

  const handleDecreaseFontSize = () => {
    updateSettings({
      ...readerSettingsState,
      fontSize: Math.max(MIN_FONT_SIZE, readerSettingsState.fontSize - FONT_STEP),
    });
  };

  const handleIncreaseFontSize = () => {
    updateSettings({
      ...readerSettingsState,
      fontSize: Math.min(MAX_FONT_SIZE, readerSettingsState.fontSize + FONT_STEP),
    });
  };

  const handleThemeChange = (theme: ReaderSettings['theme']) => {
    updateSettings({
      ...readerSettingsState,
      theme,
    });
  };

  const handleReadBlock = (block: ReadingBlock) => {
    setReadingProgress({
      documentId: block.documentId,
      blockId: block.id,
      pageNumber: block.pageNumber,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleContinueReading = () => {
    if (!readingProgress) {
      return;
    }

    const element = document.getElementById(readingProgress.blockId);

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  if (isDocumentLoading) {
    return (
      <main className="reader-page">
        <EmptyState
          title="Loading document..."
          description="Please wait."
        />
      </main>
    );
  }

  if (!documentInfo || blocks.length === 0 || !documentId) {
    return (
      <main className="reader-page">
        <EmptyState
          title="No document loaded"
          description="Please upload a German PDF first."
          action={<Link to="/">Go to upload</Link>}
        />
      </main>
    );
  }

  return (
    <main
      className={`reader-page reader-page--${readerSettingsState.theme}`}
      style={
        {
          '--reader-font-size': `${readerSettingsState.fontSize}px`,
        } as React.CSSProperties
      }
    >
      <header className="reader-page__header">
        <div>
          <p className="reader-page__eyebrow">DualRead AI</p>
          <h1 className="reader-page__title">{documentInfo.title}</h1>
        </div>

        <div className="reader-page__progress">
          {documentInfo.totalPages} pages · {totalBlocks} blocks ·{' '}
          {totalCharacters.toLocaleString()} characters ·{' '}
          {bookmarks.length} bookmarks
        </div>
      </header>

      <ReaderToolbar
        theme={readerSettingsState.theme}
        bookmarksCount={bookmarks.length}
        readingProgress={readingProgress}
        onDecreaseFontSize={handleDecreaseFontSize}
        onIncreaseFontSize={handleIncreaseFontSize}
        onThemeChange={handleThemeChange}
        onOpenBookmarks={() => setIsBookmarksPanelOpen(true)}
        onContinueReading={handleContinueReading}
      />

      {bookmarkMessage && (
        <p className="reader-page__message">
          {bookmarkMessage}
        </p>
      )}

      <BookmarksPanel
        bookmarks={bookmarks}
        isOpen={isBookmarksPanelOpen}
        onClose={() => setIsBookmarksPanelOpen(false)}
      />

      <section className="reader-page__content">
        {blocks.map((block) => (
          <ReadingBlockCard
            key={block.id}
            block={block}
            isBookmarked={isBookmarked(block.id)}
            onToggleBookmark={toggleBookmark}
            onReadBlock={handleReadBlock}
          />
        ))}
      </section>
    </main>
  );
}