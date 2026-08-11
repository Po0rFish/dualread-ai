import { useEffect, useRef } from 'react';
import type {
  TranslationProvider,
  TranslationProviderOption,
} from '../../types/service';
import type { DeepLUsageResponse } from '../../types/deepl';
import Cred from './Cred';
import Provider from './Provider';
import './SettingsDialog.scss';

interface SettingsDialogProps {
  readonly selectedProvider: TranslationProvider;
  readonly providerOptions: TranslationProviderOption[];
  readonly isDisabled: boolean;
  readonly deeplApiKey: string;
  readonly hasDeepLApiKey: boolean;
  readonly deeplUsage: DeepLUsageResponse | null;
  readonly deeplUsageError: string | null;
  readonly onProviderChange: (provider: TranslationProvider) => void;
  readonly setDeepLApiKey: (apiKey: string) => void;
  readonly clearDeepLApiKey: () => void;
  readonly onClose: () => void;
  readonly autoFocusApiKey?: boolean;
}

export default function SettingsDialog({
  selectedProvider,
  providerOptions,
  isDisabled,
  deeplApiKey,
  hasDeepLApiKey,
  deeplUsage,
  deeplUsageError,
  onProviderChange,
  setDeepLApiKey,
  clearDeepLApiKey,
  onClose,
  autoFocusApiKey = false,
}: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const characterCount =
    deeplUsage?.api_key_character_count ?? deeplUsage?.character_count;
  const characterLimit =
    deeplUsage?.api_key_character_limit ?? deeplUsage?.character_limit;
  const usagePercent =
    characterCount !== undefined && characterLimit
      ? Math.min(100, (characterCount / characterLimit) * 100)
      : 0;

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    dialog.showModal();

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  return (
    <dialog
      id="translation-panel-settings"
      ref={dialogRef}
      className="translation-settings"
      aria-labelledby="translation-settings-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <header className="translation-settings__header">
        <div>
          <p className="translation-settings__eyebrow">Configuration</p>
          <h3 id="translation-settings-title" className="translation-settings__title">
            Translation settings
          </h3>
        </div>
        <button
          type="button"
          className="translation-settings__close"
          aria-label="Close translation settings"
          onClick={onClose}
        >
          ×
        </button>
      </header>

      <Provider
        selectedProvider={selectedProvider}
        providerOptions={providerOptions}
        isDisabled={isDisabled}
        onProviderChange={onProviderChange}
      />

      {selectedProvider === 'deepl' && (
        <>
          <Cred
            deeplApiKey={deeplApiKey}
            hasDeepLApiKey={hasDeepLApiKey}
            isDisabled={isDisabled}
            setDeepLApiKey={setDeepLApiKey}
            clearDeepLApiKey={clearDeepLApiKey}
            autoFocusApiKey={autoFocusApiKey}
          />

          {(deeplUsage || deeplUsageError) && (
            <section className="translation-settings__usage">
              <p className="translation-settings__usage-label">DeepL usage</p>
              {deeplUsage && characterCount !== undefined && characterLimit !== undefined && (
                <>
                  <p className="translation-settings__usage-value">
                    <strong>{characterCount.toLocaleString()}</strong>
                    {' / '}
                    {characterLimit.toLocaleString()} max characters
                  </p>
                  <div className="translation-settings__usage-track" aria-hidden="true">
                    <span style={{ width: `${usagePercent}%` }} />
                  </div>
                  <p className="translation-settings__usage-remaining">
                    {Math.max(0, characterLimit - characterCount).toLocaleString()} remaining
                  </p>
                </>
              )}
              {deeplUsageError && (
                <p className="translation-settings__usage-error">{deeplUsageError}</p>
              )}
            </section>
          )}
        </>
      )}

      <button type="button" className="translation-settings__done" onClick={onClose}>
        Done
      </button>
    </dialog>
  );
}
