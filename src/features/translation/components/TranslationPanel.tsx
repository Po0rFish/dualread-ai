import { useState } from 'react';
import { translateText } from '../services/translationService';
import type {
  TranslationProvider,
  TranslationProviderOption,
} from '../types/service';
import type { TranslationItem } from '../types/translation';

interface TranslationPanelProps {
  readonly items: TranslationItem[];
  readonly selectedProvider: TranslationProvider;
  readonly providerOptions: TranslationProviderOption[];
  readonly onProviderChange: (provider: TranslationProvider) => void;
  readonly onUpdateItem: (
    itemId: string,
    translatedText: string,
  ) => Promise<void>;
  readonly onMarkItemError: (
    itemId: string,
    errorMessage: string,
  ) => void;
  readonly onRemoveItem: (itemId: string) => void;
  readonly onClearItems: () => void;
}

const getStatusText = (item: TranslationItem): string => {
  if (item.translationStatus === 'cached') {
    return 'Saved translation';
  }

  if (item.translationStatus === 'translated') {
    return 'New translation';
  }

  if (item.translationStatus === 'error') {
    return 'Translation error';
  }

  return 'Not translated yet';
};

const getTranslateButtonText = (
  item: TranslationItem,
  isTranslating: boolean,
): string => {
  if (isTranslating) {
    return 'Translating...';
  }

  if (item.translatedText) {
    return 'Retranslate';
  }

  return 'Translate';
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Translation failed.';
};

export default function TranslationPanel({
  items,
  selectedProvider,
  providerOptions,
  onProviderChange,
  onUpdateItem,
  onMarkItemError,
  onRemoveItem,
  onClearItems,
}: TranslationPanelProps) {
  const [translatingItemIds, setTranslatingItemIds] = useState<
    string[]
  >([]);

  const isItemTranslating = (itemId: string): boolean => {
    return translatingItemIds.includes(itemId);
  };

  const startItemTranslation = (itemId: string): void => {
    setTranslatingItemIds((currentItemIds) => {
      if (currentItemIds.includes(itemId)) {
        return currentItemIds;
      }

      return [...currentItemIds, itemId];
    });
  };

  const finishItemTranslation = (itemId: string): void => {
    setTranslatingItemIds((currentItemIds) => {
      return currentItemIds.filter((currentItemId) => {
        return currentItemId !== itemId;
      });
    });
  };

  const handleTranslateClick = (item: TranslationItem): void => {
    const translateItem = async (): Promise<void> => {
      try {
        startItemTranslation(item.id);

        const translationResult = await translateText({
          sourceText: item.sourceText,
          targetLanguage: item.targetLanguage,
          provider: selectedProvider,
        });

        await onUpdateItem(item.id, translationResult.translatedText);
      } catch (error) {
        onMarkItemError(item.id, getErrorMessage(error));
      } finally {
        finishItemTranslation(item.id);
      }
    };

    void translateItem();
  };

  return (
    <aside className="translation-panel">
      <header className="translation-panel__header">
        <h2 className="translation-panel__title">Translation</h2>

        {items.length > 0 && (
          <button
            type="button"
            className="translation-panel__clear-button"
            onClick={onClearItems}
          >
            Clear
          </button>
        )}
      </header>

      <div className="translation-panel__provider">
        <label className="translation-panel__provider-label">
          <span className="translation-panel__provider-text">
            Translation provider
          </span>

          <select
            className="translation-panel__provider-select"
            value={selectedProvider}
            onChange={(event) => {
              onProviderChange(event.target.value as TranslationProvider);
            }}
          >
            {providerOptions.map((option) => {
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            })}
          </select>
        </label>

        <p className="translation-panel__provider-description">
          {
            providerOptions.find((option) => {
              return option.value === selectedProvider;
            })?.description
          }
        </p>
      </div>

      {items.length === 0 && (
        <p className="translation-panel__empty">
          Add selected sentence to translation.
        </p>
      )}

      {items.length > 0 && (
        <div className="translation-panel__items">
          {items.map((item) => {
            const isTranslating = isItemTranslating(item.id);

            return (
              <article
                key={item.id}
                className="translation-panel__item"
              >
                <header className="translation-panel__item-header">
                  <small className="translation-panel__item-meta">
                    {item.sourceType} · {getStatusText(item)}
                  </small>

                  <button
                    type="button"
                    className="translation-panel__remove-button"
                    onClick={() => {
                      onRemoveItem(item.id);
                    }}
                  >
                    Remove
                  </button>
                </header>

                <div className="translation-panel__block">
                  <h3 className="translation-panel__block-title">
                    Original
                  </h3>

                  <p className="translation-panel__source-text">
                    {item.sourceText}
                  </p>
                </div>

                <div className="translation-panel__block">
                  <h3 className="translation-panel__block-title">
                    Translation
                  </h3>

                  {item.translatedText ? (
                    <p className="translation-panel__translated-text">
                      {item.translatedText}
                    </p>
                  ) : (
                    <p className="translation-panel__placeholder">
                      Not translated yet.
                    </p>
                  )}

                  {item.translationError && (
                    <p className="translation-panel__error">
                      {item.translationError}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="translation-panel__translate-button"
                  onClick={() => {
                    handleTranslateClick(item);
                  }}
                  disabled={isTranslating}
                >
                  {getTranslateButtonText(item, isTranslating)}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </aside>
  );
}