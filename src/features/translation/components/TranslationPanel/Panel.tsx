import { useState } from 'react';
import { useTranslationCredentials } from '../../context/useCred';
import { useTranslationPanelActions } from '../../hooks/useTranslationPanelActions';
import type {
  TranslationProvider,
  TranslationProviderOption,
} from '../../types/service';
import type { TranslationItem } from '../../types/translation';
import Item from './Item';
import SettingsDialog from './SettingsDialog';
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
  const [areSettingsOpen, setAreSettingsOpen] = useState(false);
  const {
    deeplApiKey,
    setDeepLApiKey,
    clearDeepLApiKey,
    getApiKeyForProvider,
  } = useTranslationCredentials();

  const isDeepLSelected = selectedProvider === 'deepl';
  const hasDeepLApiKey = deeplApiKey.trim().length > 0;
  const isTranslationProviderReady = !isDeepLSelected || hasDeepLApiKey;
  const {
    hasActiveTranslation,
    copiedItemId,
    copyErrorItemId,
    isItemTranslating,
    handleCopy,
    handleTranslate,
  } = useTranslationPanelActions({
    selectedProvider,
    isTranslationProviderReady,
    getApiKeyForProvider,
    onUpdateItem,
    onMarkItemError,
  });

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
  return (
    <aside className="translation-panel">
      <header className="translation-panel__header">
        <h2 className="translation-panel__title">Translation</h2>

        <div className="translation-panel__header-actions">
          <button
            type="button"
            className="translation-panel__settings-button"
            aria-expanded={areSettingsOpen}
            aria-controls="translation-panel-settings"
            aria-haspopup="dialog"
            onClick={() => {
              setAreSettingsOpen((currentValue) => !currentValue);
            }}
          >
            Settings
          </button>

          {items.length > 0 && (
            <button
              type="button"
              className="translation-panel__clear-button"
              title={
                hasActiveTranslation
                  ? 'Wait until translation request finishes.'
                  : 'Clear this panel. Saved translations remain available.'
              }
              onClick={handleClearItemsClick}
              disabled={hasActiveTranslation}
            >
              Clear panel
            </button>
          )}
        </div>
      </header>

      {areSettingsOpen && (
        <SettingsDialog
          selectedProvider={selectedProvider}
          providerOptions={providerOptions}
          isDisabled={hasActiveTranslation}
          deeplApiKey={deeplApiKey}
          hasDeepLApiKey={hasDeepLApiKey}
          onProviderChange={handleProviderChange}
          setDeepLApiKey={setDeepLApiKey}
          clearDeepLApiKey={clearDeepLApiKey}
          onClose={() => {
            setAreSettingsOpen(false);
          }}
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
                hasCopyError={copyErrorItemId === item.id}
                onTranslate={handleTranslate}
                onCopyTranslation={handleCopy}
                onRemove={onRemoveItem}
              />
            );
          })}
        </div>
      )}
    </aside>
  );
}
