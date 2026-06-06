import type { Bookmark } from '../../../shared/types/reader';

interface BookmarksPanelProps {
  bookmarks: Bookmark[];
  isOpen: boolean;
  onClose: () => void;
}

export function BookmarksPanel({
  bookmarks,
  isOpen,
  onClose,
}: BookmarksPanelProps) {
  const handleBookmarkClick = (blockId: string) => {
    const element = document.getElementById(blockId);

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="bookmarks-panel">
      <div className="bookmarks-panel__header">
        <h2>Bookmarks</h2>

        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>

      {bookmarks.length === 0 ? (
        <p className="bookmarks-panel__empty">
          No bookmarks yet.
        </p>
      ) : (
        <div className="bookmarks-panel__list">
          {bookmarks.map((bookmark) => (
            <button
              key={bookmark.id}
              type="button"
              className="bookmarks-panel__item"
              onClick={() => handleBookmarkClick(bookmark.blockId)}
            >
              <span className="bookmarks-panel__page">
                Page {bookmark.pageNumber}
              </span>

              <span className="bookmarks-panel__preview">
                {bookmark.textPreview}
              </span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}