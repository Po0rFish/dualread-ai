import type { Bookmark } from '../types/reader';

const STORAGE_KEY = 'dualread-ai:bookmarks';
const MAX_BOOKMARKS_PER_DOCUMENT = 50;

type BookmarksMap = Record<string, Bookmark[]>;

export interface ToggleBookmarkResult {
  bookmarks: Bookmark[];
  status: 'added' | 'removed' | 'limit-reached';
}

const readBookmarksMap = (): BookmarksMap => {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue) as BookmarksMap;
  } catch {
    return {};
  }
};

const writeBookmarksMap = (bookmarksMap: BookmarksMap): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarksMap));
};

export const getDocumentBookmarks = (documentId: string): Bookmark[] => {
  const bookmarksMap = readBookmarksMap();

  return bookmarksMap[documentId] ?? [];
};

export const setDocumentBookmarks = (
  documentId: string,
  bookmarks: Bookmark[],
): void => {
  const bookmarksMap = readBookmarksMap();

  bookmarksMap[documentId] = bookmarks;

  writeBookmarksMap(bookmarksMap);
};

export const toggleBookmark = (
  bookmark: Bookmark,
): ToggleBookmarkResult => {
  const currentBookmarks = getDocumentBookmarks(bookmark.documentId);

  const existingBookmark = currentBookmarks.find(
    (item) => item.blockId === bookmark.blockId,
  );

  if (existingBookmark) {
    const nextBookmarks = currentBookmarks.filter(
      (item) => item.blockId !== bookmark.blockId,
    );

    setDocumentBookmarks(bookmark.documentId, nextBookmarks);

    return {
      bookmarks: nextBookmarks,
      status: 'removed',
    };
  }

  if (currentBookmarks.length >= MAX_BOOKMARKS_PER_DOCUMENT) {
    return {
      bookmarks: currentBookmarks,
      status: 'limit-reached',
    };
  }

  const nextBookmarks = [...currentBookmarks, bookmark];

  setDocumentBookmarks(bookmark.documentId, nextBookmarks);

  return {
    bookmarks: nextBookmarks,
    status: 'added',
  };
};

export const deleteDocumentBookmarks = (documentId: string): void => {
  const bookmarksMap = readBookmarksMap();

  delete bookmarksMap[documentId];

  writeBookmarksMap(bookmarksMap);
};