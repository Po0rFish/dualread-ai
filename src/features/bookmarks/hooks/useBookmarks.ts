import { useMemo, useState } from 'react';
import type { Bookmark } from '../../../shared/types/reader';
import {
  getDocumentBookmarks,
  toggleBookmark,
} from '../../../shared/storage/bookmarksStorage';

export const useBookmarks = (documentId: string) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() =>
    getDocumentBookmarks(documentId),
  );

  const [bookmarkMessage, setBookmarkMessage] = useState<string | null>(null);

  const bookmarkedBlockIds = useMemo(() => {
    return new Set(bookmarks.map((bookmark) => bookmark.blockId));
  }, [bookmarks]);

  const isBookmarked = (blockId: string): boolean => {
    return bookmarkedBlockIds.has(blockId);
  };

  const handleToggleBookmark = (bookmark: Bookmark): void => {
    const result = toggleBookmark(bookmark);

    setBookmarks(result.bookmarks);

    if (result.status === 'limit-reached') {
      setBookmarkMessage(
        'Bookmark limit reached. You can keep up to 50 bookmarks per document.',
      );
      return;
    }

    setBookmarkMessage(null);
  };

  return {
    bookmarks,
    bookmarkMessage,
    isBookmarked,
    toggleBookmark: handleToggleBookmark,
  };
};