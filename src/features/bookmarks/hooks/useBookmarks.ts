import { useMemo, useState } from 'react';
import type { BookmarkItem } from '../components/BookmarksPanel';

const MAX_BOOKMARKS_PER_DOCUMENT = 50;

interface UseBookmarksResult {
  readonly bookmarks: BookmarkItem[];
  readonly bookmarkMessage: string | null;
  readonly isBookmarked: (segmentId: string) => boolean;
  readonly addBookmark: (bookmark: BookmarkItem) => void;
  readonly removeBookmark: (bookmarkId: string) => void;
  readonly toggleBookmark: (bookmark: BookmarkItem) => void;
  readonly clearBookmarkMessage: () => void;
}

export const useBookmarks = (): UseBookmarksResult => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [bookmarkMessage, setBookmarkMessage] = useState<string | null>(null);

  const bookmarkedSegmentIds = useMemo(() => {
    return new Set(
      bookmarks.map((bookmark) => {
        return bookmark.segmentId;
      }),
    );
  }, [bookmarks]);

  const isBookmarked = (segmentId: string): boolean => {
    return bookmarkedSegmentIds.has(segmentId);
  };

  const addBookmark = (bookmark: BookmarkItem): void => {
    setBookmarks((currentBookmarks) => {
      const alreadyExists = currentBookmarks.some((currentBookmark) => {
        return currentBookmark.id === bookmark.id;
      });

      if (alreadyExists) {
        setBookmarkMessage(null);
        return currentBookmarks;
      }

      if (currentBookmarks.length >= MAX_BOOKMARKS_PER_DOCUMENT) {
        setBookmarkMessage(
          'Bookmark limit reached. You can keep up to 50 bookmarks per document.',
        );

        return currentBookmarks;
      }

      setBookmarkMessage(null);

      return [...currentBookmarks, bookmark];
    });
  };

  const removeBookmark = (bookmarkId: string): void => {
    setBookmarks((currentBookmarks) => {
      return currentBookmarks.filter((bookmark) => {
        return bookmark.id !== bookmarkId;
      });
    });

    setBookmarkMessage(null);
  };

  const toggleBookmark = (bookmark: BookmarkItem): void => {
    setBookmarks((currentBookmarks) => {
      const alreadyExists = currentBookmarks.some((currentBookmark) => {
        return currentBookmark.id === bookmark.id;
      });

      if (alreadyExists) {
        setBookmarkMessage(null);

        return currentBookmarks.filter((currentBookmark) => {
          return currentBookmark.id !== bookmark.id;
        });
      }

      if (currentBookmarks.length >= MAX_BOOKMARKS_PER_DOCUMENT) {
        setBookmarkMessage(
          'Bookmark limit reached. You can keep up to 50 bookmarks per document.',
        );

        return currentBookmarks;
      }

      setBookmarkMessage(null);

      return [...currentBookmarks, bookmark];
    });
  };

  const clearBookmarkMessage = (): void => {
    setBookmarkMessage(null);
  };

  return {
    bookmarks,
    bookmarkMessage,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    clearBookmarkMessage,
  };
};