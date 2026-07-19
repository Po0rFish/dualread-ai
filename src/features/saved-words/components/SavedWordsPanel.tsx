import type { ReactNode } from 'react';

export interface SavedWordItem {
  readonly id: string;
  readonly documentId: string;
  readonly word: string;
  readonly context: string;
  readonly pageNumber: number;
  readonly segmentId?: string;
  readonly createdAt: string;
}

interface SavedWordsPanelProps {
  readonly savedWords: SavedWordItem[];
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onDeleteWord: (wordId: string) => void;
  readonly onSelectWordContext?: (savedWord: SavedWordItem) => void;
}

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const renderHighlightedContext = (
  context: string,
  word: string,
): ReactNode => {
  const normalizedWord = word.trim();

  if (!normalizedWord) {
    return context;
  }

  const wordRegex = new RegExp(`(${escapeRegExp(normalizedWord)})`, 'gi');
  const parts = context.split(wordRegex);

  return parts.map((part, index) => {
    const isMatch = part.toLowerCase() === normalizedWord.toLowerCase();

    if (!isMatch) {
      return part;
    }

    return (
      <mark
        key={`${part}-${index}`}
        className="saved-words-panel__highlight"
      >
        {part}
      </mark>
    );
  });
};

export default function SavedWordsPanel({
  savedWords,
  isOpen,
  onClose,
  onDeleteWord,
  onSelectWordContext,
}: SavedWordsPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <aside className="saved-words-panel">
      <header className="saved-words-panel__header">
        <h2 className="saved-words-panel__title">Saved words</h2>

        <button
          type="button"
          className="saved-words-panel__close-button"
          onClick={onClose}
        >
          Close
        </button>
      </header>

      {savedWords.length === 0 && (
        <p className="saved-words-panel__empty">
          No saved words yet.
        </p>
      )}

      {savedWords.length > 0 && (
        <div className="saved-words-panel__list">
          {savedWords.map((savedWord) => {
            return (
              <article
                key={savedWord.id}
                className="saved-words-panel__item"
              >
                <div className="saved-words-panel__item-content">
                  <strong className="saved-words-panel__word">
                    {savedWord.word}
                  </strong>

                  <p className="saved-words-panel__context">
                    {renderHighlightedContext(
                      savedWord.context,
                      savedWord.word,
                    )}
                  </p>

                  <small className="saved-words-panel__meta">
                    Page {savedWord.pageNumber}
                  </small>
                </div>

                <div className="saved-words-panel__item-actions">
                  {onSelectWordContext && (
                    <button
                      type="button"
                      className="saved-words-panel__context-button"
                      onClick={() => {
                        onSelectWordContext(savedWord);
                      }}
                    >
                      Open context
                    </button>
                  )}

                  <button
                    type="button"
                    className="saved-words-panel__delete-button"
                    onClick={() => {
                      onDeleteWord(savedWord.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </aside>
  );
}