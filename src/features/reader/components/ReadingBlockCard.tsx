import { useState } from 'react';
import type {
  Bookmark,
  ReadingBlock,
} from '../../../shared/types/reader';
import { Button } from '../../../shared/components';
import { mockTranslateToEnglish } from '../../translation/services/mockTranslator';

interface ReadingBlockCardProps {
  readonly block: ReadingBlock;
  readonly isBookmarked: boolean;
  readonly onToggleBookmark: (bookmark: Bookmark) => void;
  readonly onReadBlock: (block: ReadingBlock) => void;
  readonly onSaveWord: (word: string, block: ReadingBlock) => void;
}

const getSelectedWord = (): string | null => {
  const selection = globalThis.getSelection();
  const selectedText = selection?.toString().trim();

  if (!selectedText) {
    return null;
  }

  const singleWord = selectedText.match(/^[\p{L}ÄÖÜäöüß-]+$/u);

  if (!singleWord) {
    return null;
  }

  return selectedText;
};

export function ReadingBlockCard({
  block,
  isBookmarked,
  onToggleBookmark,
  onReadBlock,
  onSaveWord,
}: ReadingBlockCardProps) {
  const [translatedText, setTranslatedText] = useState(block.translatedText);
  const [isVisible, setIsVisible] = useState(block.isTranslationVisible);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const handleShowTranslation = async () => {
    if (translatedText) {
      setIsVisible(true);
      return;
    }

    setIsLoading(true);

    try {
      const translation = await mockTranslateToEnglish(block.originalText);
      setTranslatedText(translation);
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = () => {
    onToggleBookmark({
      id: `${block.documentId}-${block.id}`,
      documentId: block.documentId,
      blockId: block.id,
      pageNumber: block.pageNumber,
      textPreview: block.originalText.slice(0, 120),
      createdAt: new Date().toISOString(),
    });
  };

  const handleReadBlock = () => {
    onReadBlock(block);
  };

  const handleTextMouseUp = () => {
    const word = getSelectedWord();

    setSelectedWord(word);
  };

  const handleSaveSelectedWord = () => {
    if (!selectedWord) {
      return;
    }

    onSaveWord(selectedWord, block);
    setSelectedWord(null);
    globalThis.getSelection()?.removeAllRanges();
  };

  return (
    <article
      id={block.id}
      className={`reading-block reading-block--${block.type}`}
      onClick={handleReadBlock}
    >
      <div className="reading-block__meta">
        Page {block.pageNumber} · {block.type}
      </div>

      <div onMouseUp={handleTextMouseUp}>
        {block.type === 'title' && (
          <h2 className="reading-block__title">{block.originalText}</h2>
        )}

        {block.type === 'subtitle' && (
          <h3 className="reading-block__subtitle">
            {block.originalText}
          </h3>
        )}

        {block.type === 'note' && (
          <p className="reading-block__note">{block.originalText}</p>
        )}

        {block.type === 'paragraph' && (
          <p className="reading-block__original">
            {block.originalText}
          </p>
        )}
      </div>

      {selectedWord && (
        <div
          className="reading-block__selection-actions"
          onClick={(event) => event.stopPropagation()}
        >
          <span>Selected: {selectedWord}</span>

          <Button variant="secondary" onClick={handleSaveSelectedWord}>
            Save word
          </Button>
        </div>
      )}

      {isVisible && translatedText && (
        <p className="reading-block__translation">{translatedText}</p>
      )}

      <div
        className="reading-block__actions"
        onClick={(event) => event.stopPropagation()}
      >
        {isVisible ? (
          <Button variant="secondary" onClick={() => setIsVisible(false)}>
            Hide translation
          </Button>
        ) : (
          <Button onClick={handleShowTranslation} disabled={isLoading}>
            {isLoading ? 'Translating...' : 'Show translation'}
          </Button>
        )}

        <Button variant="secondary" onClick={handleToggleBookmark}>
          {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
        </Button>
      </div>
    </article>
  );
}