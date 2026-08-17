import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslationCredentials } from '../../context/useCred';
import { useTranslationPanelActions } from '../../hooks/useTranslationPanelActions';
import type { TranslationItem } from '../../types/translation';
import { getTranslateButtonText } from '../TranslationPanel/helpers';
import './TranslationPopover.scss';

interface TranslationPopoverProps {
  readonly item: TranslationItem | null;
  readonly onUpdateItem: (itemId: string, translatedText: string) => Promise<void>;
  readonly onMarkItemError: (itemId: string, errorMessage: string) => void;
  readonly onOpenSettings: (focusApiKey?: boolean) => void;
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
  onUpdateItem,
  onMarkItemError,
  onOpenSettings,
  onClose,
}: TranslationPopoverProps) {
  const [fontSize, setFontSize] = useState<PopoverFontSize>(getInitialFontSize);
  const {
    deeplApiKey,
    getDeepLApiKey,
  } = useTranslationCredentials();

  const hasDeepLApiKey = deeplApiKey.trim().length > 0;
  const isDeepLReady = hasDeepLApiKey;
  const {
    copiedTextKey,
    copyErrorTextKey,
    isItemTranslating,
    handleCopy,
    handleTranslate,
  } = useTranslationPanelActions({
    isDeepLReady,
    getDeepLApiKey,
    onUpdateItem,
    onMarkItemError,
  });

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
              onOpenSettings();
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
                if (!isDeepLReady) {
                  onOpenSettings(true);
                  return;
                }

                handleTranslate(item);
              }}
              disabled={isTranslating}
            >
              {isDeepLReady
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

    </aside>
  );
}
