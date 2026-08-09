import type { TranslationItem } from '../../types/translation';
import { getTranslateButtonText } from './helpers';

interface ItemProps {
  readonly item: TranslationItem;
  readonly isTranslating: boolean;
  readonly isTranslationProviderReady: boolean;
  readonly isCopied: boolean;
  readonly hasCopyError: boolean;
  readonly onTranslate: (item: TranslationItem) => void;
  readonly onCopyTranslation: (item: TranslationItem) => void;
  readonly onRemove: (itemId: string) => void;
}

export default function Item({
  item,
  isTranslating,
  isTranslationProviderReady,
  isCopied,
  hasCopyError,
  onTranslate,
  onCopyTranslation,
  onRemove,
}: ItemProps) {
  const shouldShowTranslationError =
    !isTranslating && item.translationError;
  const placeholderText = isTranslating
    ? 'Translation in progress...'
    : 'Not translated yet.';

  return (
    <article className="translation-panel__item" aria-busy={isTranslating}>
      <section className="translation-panel__block">
        <header className="translation-panel__block-header">
          <h3 className="translation-panel__block-title">Source</h3>
          <button
            type="button"
            className="translation-panel__remove-button"
            title={
              isTranslating
                ? 'Wait until translation request finishes.'
                : undefined
            }
            onClick={() => {
              onRemove(item.id);
            }}
            disabled={isTranslating}
          >
            Remove
          </button>
        </header>

        <p className="translation-panel__source-text">{item.sourceText}</p>
      </section>

      <section className="translation-panel__block">
        <header className="translation-panel__block-header">
          <h3 className="translation-panel__block-title">Translation</h3>
          {item.translatedText && (
            <button
              type="button"
              className="translation-panel__copy-button"
              onClick={() => {
                onCopyTranslation(item);
              }}
              disabled={isTranslating}
            >
              {isCopied ? 'Copied' : 'Copy'}
            </button>
          )}
        </header>

        {item.translatedText ? (
          <p className="translation-panel__translated-text">
            {item.translatedText}
          </p>
        ) : (
          <p className="translation-panel__placeholder">{placeholderText}</p>
        )}

        {shouldShowTranslationError && (
          <p className="translation-panel__error" role="alert">
            {item.translationError}
          </p>
        )}

        {hasCopyError && (
          <p className="translation-panel__error" role="alert">
            Could not copy translation.
          </p>
        )}
      </section>

      {!item.translatedText && (
        <div className="translation-panel__item-actions">
          <button
            type="button"
            className="translation-panel__translate-button"
            title={
              isTranslationProviderReady
                ? undefined
                : 'Enter your DeepL API key to enable translation.'
            }
            onClick={() => {
              onTranslate(item);
            }}
            disabled={isTranslating || !isTranslationProviderReady}
          >
            {isTranslationProviderReady
              ? getTranslateButtonText(item, isTranslating)
              : 'Enter API key'}
          </button>
        </div>
      )}
    </article>
  );
}
