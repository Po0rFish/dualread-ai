import type { SavedWord } from '../../../shared/types/reader';

interface SavedWordsPanelProps {
  savedWords: SavedWord[];
  isOpen: boolean;
  onClose: () => void;
  onDeleteWord: (wordId: string) => void;
}

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const renderHighlightedContext = (
  contextSentence: string,
  word: string,
): React.ReactNode => {
  const normalizedWord = word.trim();

  if (!normalizedWord) {
    return contextSentence;
  }

  const wordRegex = new RegExp(`(${escapeRegExp(normalizedWord)})`, 'gi');
  const parts = contextSentence.split(wordRegex);

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

export function SavedWordsPanel({
  savedWords,
  isOpen,
  onClose,
  onDeleteWord,
}: SavedWordsPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <aside className="saved-words-panel">
      <div className="saved-words-panel__header">
        <h2>Saved words</h2>

        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>

      {savedWords.length === 0 ? (
        <p className="saved-words-panel__empty">
          No saved words yet.
        </p>
      ) : (
        <div className="saved-words-panel__list">
          {savedWords.map((savedWord) => (
            <article
              key={savedWord.id}
              className="saved-words-panel__item"
            >
              <div>
                <strong className="saved-words-panel__word">
                  {savedWord.word}
                </strong>

                <p className="saved-words-panel__context">
                  {renderHighlightedContext(
                    savedWord.contextSentence,
                    savedWord.word,
                  )}
                </p>

                <span className="saved-words-panel__page">
                  Page {savedWord.pageNumber}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onDeleteWord(savedWord.id)}
              >
                Delete
              </button>
            </article>
          ))}
        </div>
      )}
    </aside>
  );
}