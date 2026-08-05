import type { TranslationItem } from '../../types/translation';
import { getStatusText, getTranslateButtonText } from './helpers';

interface ItemProps {
  readonly item: TranslationItem;
  readonly isTranslating: boolean;
  readonly isTranslationProviderReady: boolean;
  readonly onTranslate: (item: TranslationItem) => void;
  readonly onRemove: (itemId: string) => void;
}

export default function Item({
  item,
  isTranslating,
  isTranslationProviderReady,
  onTranslate,
  onRemove,
}: ItemProps) {
  return (
    <article className="translation-panel__item">
      <header className="translation-panel__item-header">
        <small className="translation-panel__item-meta">
          {item.sourceType} · {getStatusText(item)}
        </small>

        <button
          type="button"
          className="translation-panel__remove-button"
          onClick={() => {
            onRemove(item.id);
          }}
        >
          Remove
        </button>
      </header>

      <div className="translation-panel__block">
        <h3 className="translation-panel__block-title">Original</h3>

        <p className="translation-panel__source-text">
          {item.sourceText}
        </p>
      </div>

      <div className="translation-panel__block">
        <h3 className="translation-panel__block-title">Translation</h3>

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
    </article>
  );
}