import { useEffect, useRef } from 'react';
import type {
  TranslationProvider,
  TranslationProviderOption,
} from '../../types/service';
import Cred from './Cred';
import Provider from './Provider';
import './SettingsDialog.scss';

interface SettingsDialogProps {
  readonly selectedProvider: TranslationProvider;
  readonly providerOptions: TranslationProviderOption[];
  readonly isDisabled: boolean;
  readonly deeplApiKey: string;
  readonly hasDeepLApiKey: boolean;
  readonly onProviderChange: (provider: TranslationProvider) => void;
  readonly setDeepLApiKey: (apiKey: string) => void;
  readonly clearDeepLApiKey: () => void;
  readonly onClose: () => void;
}

export default function SettingsDialog({
  selectedProvider,
  providerOptions,
  isDisabled,
  deeplApiKey,
  hasDeepLApiKey,
  onProviderChange,
  setDeepLApiKey,
  clearDeepLApiKey,
  onClose,
}: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

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
        <Cred
          deeplApiKey={deeplApiKey}
          hasDeepLApiKey={hasDeepLApiKey}
          isDisabled={isDisabled}
          setDeepLApiKey={setDeepLApiKey}
          clearDeepLApiKey={clearDeepLApiKey}
        />
      )}

      <button type="button" className="translation-settings__done" onClick={onClose}>
        Done
      </button>
    </dialog>
  );
}
