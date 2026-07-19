import { useState } from 'react';
import { mockTranslateText } from '../services/mockTranslator';
import type {
  TranslationItem,
  TranslationLanguage,
  TranslationResult,
} from '../types/translation';

interface TranslationPanelProps {
  readonly items: TranslationItem[];
  readonly onRemoveItem: (itemId: string) => void;
  readonly onClearItems: () => void;
}

const DEFAULT_TARGET_LANGUAGE: TranslationLanguage = 'english';

export default function TranslationPanel({
  items,
  onRemoveItem,
  onClearItems,
}: TranslationPanelProps) {
  const [targetLanguage] = useState<TranslationLanguage>(
    DEFAULT_TARGET_LANGUAGE,
  );

  const [results, setResults] = useState<TranslationResult[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasItems = items.length > 0;
  const hasResults = results.length > 0;

  const handleTranslate = async (): Promise<void> => {
    try {
      setIsTranslating(true);
      setErrorMessage(null);

      const nextResults = await Promise.all(
        items.map(async (item) => {
          const translatedText = await mockTranslateText({
            text: item.sourceText,
            targetLanguage,
          });

          return {
            id: `translation-result-${item.id}`,
            itemId: item.id,
            translatedText,
            targetLanguage,
          };
        }),
      );

      setResults(nextResults);
    } catch {
      setErrorMessage('Translation failed.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRemoveItem = (itemId: string): void => {
    setResults((currentResults) => {
      return currentResults.filter((result) => {
        return result.itemId !== itemId;
      });
    });

    onRemoveItem(itemId);
  };

  const handleClear = (): void => {
    setResults([]);
    setErrorMessage(null);
    onClearItems();
  };

  return (
    <section className="translation-panel">
      <header className="translation-panel__header">
        <h2 className="translation-panel__title">Translation</h2>

        <button
          type="button"
          className="translation-panel__clear-button"
          onClick={handleClear}
          disabled={!hasItems && !hasResults}
        >
          Clear
        </button>
      </header>

      <div className="translation-panel__controls">
        <p className="translation-panel__language">
          Target language: English
        </p>

        <button
          type="button"
          className="translation-panel__translate-button"
          onClick={() => {
            void handleTranslate();
          }}
          disabled={!hasItems || isTranslating}
        >
          {isTranslating ? 'Translating...' : 'Translate'}
        </button>
      </div>

      {errorMessage && (
        <p className="translation-panel__error">{errorMessage}</p>
      )}

      {!hasItems && (
        <p className="translation-panel__empty">
          Select a text segment to prepare translation.
        </p>
      )}

      {hasItems && (
        <div className="translation-panel__items">
          <h3 className="translation-panel__subtitle">Selected text</h3>

          {items.map((item) => {
            return (
              <article
                key={item.id}
                className="translation-panel__item"
              >
                <div className="translation-panel__item-header">
                  <small className="translation-panel__item-meta">
                    {item.sourceType}
                    {item.pageNumber ? ` · page ${item.pageNumber}` : ''}
                  </small>

                  <button
                    type="button"
                    className="translation-panel__item-remove-button"
                    onClick={() => {
                      handleRemoveItem(item.id);
                    }}
                  >
                    Remove
                  </button>
                </div>

                <p className="translation-panel__item-text">
                  {item.sourceText}
                </p>
              </article>
            );
          })}
        </div>
      )}

      {hasResults && (
        <div className="translation-panel__results">
          <h3 className="translation-panel__subtitle">Result</h3>

          {results.map((result) => {
            return (
              <article
                key={result.id}
                className="translation-panel__result"
              >
                <p className="translation-panel__result-text">
                  {result.translatedText}
                </p>

                <small className="translation-panel__result-meta">
                  {result.targetLanguage}
                </small>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}