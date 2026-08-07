import { useState } from 'react';
import { useTranslationCredentials } from '../../context/useCred';
import { translateText } from '../../services/translationService';
import type {
  TranslationProvider,
  TranslationProviderOption,
} from '../../types/service';
import type { TranslationItem } from '../../types/translation';
import Cred from './Cred';
import Item from './Item';
import Provider from './Provider';
import { getErrorMessage } from './helpers';
import './Panel.scss';

interface TranslationPanelProps {
  readonly items: TranslationItem[];
  readonly selectedProvider: TranslationProvider;
  readonly providerOptions: TranslationProviderOption[];
  readonly onProviderChange: (provider: TranslationProvider) => void;
  readonly onUpdateItem: (itemId: string, translatedText: string,) => Promise<void>;
  readonly onMarkItemError: (itemId: string, errorMessage: string,) => void;
  readonly onRemoveItem: (itemId: string) => void;
  readonly onClearItems: () => void;
}

export default function Panel({
  items,
  selectedProvider,
  providerOptions,
  onProviderChange,
  onUpdateItem,
  onMarkItemError,
  onRemoveItem,
  onClearItems,
}: TranslationPanelProps) {
  const [translatingItemIds, setTranslatingItemIds] = useState<string[]>([]);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null,);
  const {
    deeplApiKey,
    setDeepLApiKey,
    clearDeepLApiKey,
    getApiKeyForProvider,
  } = useTranslationCredentials();

  const hasActiveTranslation = translatingItemIds.length > 0;
  const isDeepLSelected = selectedProvider === 'deepl';
  const hasDeepLApiKey = deeplApiKey.trim().length > 0;
  const isTranslationProviderReady = !isDeepLSelected || hasDeepLApiKey;

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

  const handleProviderChange = (
    provider: TranslationProvider,
  ): void => {
    if (hasActiveTranslation) {
      return;
    }

    onProviderChange(provider);
  };

  const handleClearItemsClick = (): void => {
    if (hasActiveTranslation) {
      return;
    }

    onClearItems();
  };
  const handleCopyTranslationClick = (item: TranslationItem): void => {
    if (!item.translatedText) {
      return;
    }

    const copyTranslation = async (): Promise<void> => {
      try {
        await navigator.clipboard.writeText(item.translatedText ?? '');

        setCopiedItemId(item.id);

        window.setTimeout(() => {
          setCopiedItemId((currentCopiedItemId) => {
            if (currentCopiedItemId !== item.id) {
              return currentCopiedItemId;
            }

            return null;
          });
        }, 1200);
      } catch {
        setCopiedItemId(null);
      }
    };

    void copyTranslation();
  };

  const handleTranslateClick = (item: TranslationItem): void => {
    if (!isTranslationProviderReady || isItemTranslating(item.id)) {
      return;
    }

    const translateItem = async (): Promise<void> => {
      try {
        startItemTranslation(item.id);

        const translationResult = await translateText({
          sourceText: item.sourceText,
          targetLanguage: item.targetLanguage,
          provider: selectedProvider,
          apiKey: getApiKeyForProvider(selectedProvider),
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
            title={
              hasActiveTranslation
                ? 'Wait until translation request finishes.'
                : undefined
            }
            onClick={handleClearItemsClick}
            disabled={hasActiveTranslation}
          >
            Clear
          </button>
        )}
      </header>

      <Provider
        selectedProvider={selectedProvider}
        providerOptions={providerOptions}
        isDisabled={hasActiveTranslation}
        onProviderChange={handleProviderChange}
      />

      {isDeepLSelected && (
        <Cred
          deeplApiKey={deeplApiKey}
          hasDeepLApiKey={hasDeepLApiKey}
          isDisabled={hasActiveTranslation}
          setDeepLApiKey={setDeepLApiKey}
          clearDeepLApiKey={clearDeepLApiKey}
        />
      )}

      {items.length === 0 && (
        <p className="translation-panel__empty">
          Add selected sentence to translation.
        </p>
      )}

      {items.length > 0 && (
        <div className="translation-panel__items">
          {items.map((item) => {
            return (
              <Item
                key={item.id}
                item={item}
                isTranslating={isItemTranslating(item.id)}
                isTranslationProviderReady={isTranslationProviderReady}
                isCopied={copiedItemId === item.id}
                onTranslate={handleTranslateClick}
                onCopyTranslation={handleCopyTranslationClick}
                onRemove={onRemoveItem}
              />
            );
          })}
        </div>
      )}
    </aside>
  );
}