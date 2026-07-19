export interface BookmarkItem {
  readonly id: string;
  readonly documentId: string;
  readonly pageNumber: number;
  readonly segmentId: string;
  readonly textPreview: string;
  readonly createdAt: string;
}

interface BookmarksPanelProps {
  readonly bookmarks: BookmarkItem[];
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSelectBookmark: (bookmark: BookmarkItem) => void;
}

export default function BookmarksPanel({
  bookmarks,
  isOpen,
  onClose,
  onSelectBookmark,
}: BookmarksPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <aside className="bookmarks-panel">
      <header className="bookmarks-panel__header">
        <h2 className="bookmarks-panel__title">Bookmarks</h2>

        <button
          type="button"
          className="bookmarks-panel__close-button"
          onClick={onClose}
        >
          Close
        </button>
      </header>

      {bookmarks.length === 0 && (
        <p className="bookmarks-panel__empty">No bookmarks yet.</p>
      )}

      {bookmarks.length > 0 && (
        <div className="bookmarks-panel__list">
          {bookmarks.map((bookmark) => {
            return (
              <button
                key={bookmark.id}
                type="button"
                className="bookmarks-panel__item"
                onClick={() => {
                  onSelectBookmark(bookmark);
                  onClose();
                }}
              >
                <span className="bookmarks-panel__item-page">
                  Page {bookmark.pageNumber}
                </span>

                <span className="bookmarks-panel__item-preview">
                  {bookmark.textPreview}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}