import { useState } from 'react';
import type {
  Bookmark,
  ReadingBlock,
} from '../../../shared/types/reader';
import { Button } from '../../../shared/components/index';
import { mockTranslateToEnglish } from '../../translation/services/mockTranslator';

interface ReadingBlockCardProps {
 readonly block: ReadingBlock;
 readonly isBookmarked: boolean;
 readonly onToggleBookmark: (bookmark: Bookmark) => void;
 readonly onReadBlock: (block: ReadingBlock) => void;
}

export function ReadingBlockCard({
  block,
  isBookmarked,
  onToggleBookmark,
  onReadBlock,
}: ReadingBlockCardProps) {
  const [translatedText, setTranslatedText] = useState(block.translatedText);
  const [isVisible, setIsVisible] = useState(block.isTranslationVisible);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <article
      id={block.id}
      className={`reading-block reading-block--${block.type}`}
      onClick={handleReadBlock}
    >
      <div className="reading-block__meta">
        Page {block.pageNumber} · {block.type}
      </div>

      {block.type === 'title' && (
        <h2 className="reading-block__title">{block.originalText}</h2>
      )}

      {block.type === 'subtitle' && (
        <h3 className="reading-block__subtitle">{block.originalText}</h3>
      )}

      {block.type === 'note' && (
        <p className="reading-block__note">{block.originalText}</p>
      )}

      {block.type === 'paragraph' && (
        <p className="reading-block__original">{block.originalText}</p>
      )}

      {isVisible && translatedText && (
        <p className="reading-block__translation">{translatedText}</p>
      )}

      <div className="reading-block__actions">
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