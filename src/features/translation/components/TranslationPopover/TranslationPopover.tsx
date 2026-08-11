import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslationCredentials } from '../../context/useCred';
import { useTranslationPanelActions } from '../../hooks/useTranslationPanelActions';
import type {
  TranslationProvider,
  TranslationProviderOption,
} from '../../types/service';
import type { TranslationItem } from '../../types/translation';
import SettingsDialog from '../TranslationPanel/SettingsDialog';
import { getTranslateButtonText } from '../TranslationPanel/helpers';
import './TranslationPopover.scss';

interface TranslationPopoverProps {
  readonly item: TranslationItem | null;
  readonly selectedProvider: TranslationProvider;
  readonly providerOptions: TranslationProviderOption[];
  readonly onProviderChange: (provider: TranslationProvider) => void;
  readonly onUpdateItem: (itemId: string, translatedText: string) => Promise<void>;
  readonly onMarkItemError: (itemId: string, errorMessage: string) => void;
  readonly onClose: () => void;
}

type PopoverFontSize = 'small' | 'medium' | 'large';

const FONT_SIZE_STORAGE_KEY = 'dualread-ai:translation-popover-font-size';
const FONT_SIZE_OPTIONS: ReadonlyArray<{
  value: PopoverFontSize;
  label: string;
  title: string;
  pixels: number;
}> = [
  { value: 'small', label: 'A−', title: 'Small translation text', pixels: 13 },
  { value: 'medium', label: 'A', title: 'Medium translation text', pixels: 15 },
  { value: 'large', label: 'A+', title: 'Large translation text', pixels: 18 },
];

const getInitialFontSize = (): PopoverFontSize => {
  const storedValue = window.localStorage.getItem(FONT_SIZE_STORAGE_KEY);

  return storedValue === 'small' ||
    storedValue === 'medium' ||
    storedValue === 'large'
    ? storedValue
    : 'medium';
};

export default function TranslationPopover({
  item,
  selectedProvider,
  providerOptions,
  onProviderChange,
  onUpdateItem,
  onMarkItemError,
  onClose,
}: TranslationPopoverProps) {
  const [areSettingsOpen, setAreSettingsOpen] = useState(false);
  const [shouldFocusApiKey, setShouldFocusApiKey] = useState(false);
  const [fontSize, setFontSize] = useState<PopoverFontSize>(getInitialFontSize);
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
    copiedTextKey,
    copyErrorTextKey,
    deeplUsage,
    deeplUsageError,
    clearDeepLUsage,
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

  const openSettings = (focusApiKey = false): void => {
    setShouldFocusApiKey(focusApiKey);
    setAreSettingsOpen(true);
  };

  const handleProviderChange = (provider: TranslationProvider): void => {
    if (hasActiveTranslation) {
      return;
    }

    clearDeepLUsage();
    onProviderChange(provider);
  };

  const isTranslating = item ? isItemTranslating(item.id) : false;
  const sourceCopyKey = item ? `${item.id}:source` : '';
  const translationCopyKey = item ? `${item.id}:translation` : '';
  const fontSizePixels =
    FONT_SIZE_OPTIONS.find((option) => option.value === fontSize)?.pixels ?? 15;

  const selectFontSize = (nextFontSize: PopoverFontSize): void => {
    setFontSize(nextFontSize);
    window.localStorage.setItem(FONT_SIZE_STORAGE_KEY, nextFontSize);
  };

  return (
    <aside
      className="translation-popover"
      aria-label="Sentence translation"
      style={
        {
          '--translation-popover-font-size': `${fontSizePixels}px`,
        } as CSSProperties
      }
    >
      <header className="translation-popover__header">
        <span className="translation-popover__eyebrow">Translation</span>
        <div className="translation-popover__header-actions">
          <div
            className="translation-popover__font-size"
            role="group"
            aria-label="Translation text size"
          >
            {FONT_SIZE_OPTIONS.map((option) => {
              return (
                <button
                  key={option.value}
                  type="button"
                  className="translation-popover__font-size-button"
                  aria-pressed={fontSize === option.value}
                  title={option.title}
                  onClick={() => {
                    selectFontSize(option.value);
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="translation-popover__text-button"
            onClick={() => {
              openSettings();
            }}
          >
            Settings
          </button>
          <button
            type="button"
            className="translation-popover__close-button"
            aria-label="Close translation"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </header>

      {!item && (
        <p className="translation-popover__placeholder">Preparing sentence…</p>
      )}

      {item && (
        <>
          <div className="translation-popover__source-block">
            <p className="translation-popover__source">{item.sourceText}</p>
            <button
              type="button"
              className="translation-popover__text-button"
              onClick={() => {
                handleCopy(item.sourceText, sourceCopyKey);
              }}
            >
              {copiedTextKey === sourceCopyKey ? 'Copied' : 'Copy'}
            </button>
          </div>

          {item.translatedText ? (
            <div className="translation-popover__result">
              <p className="translation-popover__translated">
                {item.translatedText}
              </p>
              <button
                type="button"
                className="translation-popover__text-button"
                onClick={() => {
                  handleCopy(item.translatedText ?? '', translationCopyKey);
                }}
                disabled={isTranslating}
              >
                {copiedTextKey === translationCopyKey ? 'Copied' : 'Copy'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="translation-popover__translate-button"
              onClick={() => {
                if (!isTranslationProviderReady) {
                  openSettings(true);
                  return;
                }

                handleTranslate(item);
              }}
              disabled={isTranslating}
            >
              {isTranslationProviderReady
                ? getTranslateButtonText(item, isTranslating)
                : 'Enter API key'}
            </button>
          )}

          {!isTranslating && item.translationError && (
            <p className="translation-popover__error" role="alert">
              {item.translationError}
            </p>
          )}

          {(copyErrorTextKey === sourceCopyKey ||
            copyErrorTextKey === translationCopyKey) && (
            <p className="translation-popover__error" role="alert">
              Could not copy translation.
            </p>
          )}
        </>
      )}

      {areSettingsOpen && (
        <SettingsDialog
          selectedProvider={selectedProvider}
          providerOptions={providerOptions}
          isDisabled={hasActiveTranslation}
          deeplApiKey={deeplApiKey}
          hasDeepLApiKey={hasDeepLApiKey}
          deeplUsage={deeplUsage}
          deeplUsageError={deeplUsageError}
          autoFocusApiKey={shouldFocusApiKey}
          onProviderChange={handleProviderChange}
          setDeepLApiKey={(apiKey) => {
            clearDeepLUsage();
            setDeepLApiKey(apiKey);
          }}
          clearDeepLApiKey={() => {
            clearDeepLUsage();
            clearDeepLApiKey();
          }}
          onClose={() => {
            setAreSettingsOpen(false);
            setShouldFocusApiKey(false);
          }}
        />
      )}
    </aside>
  );
}
