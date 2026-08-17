import { useEffect, useRef, useState } from 'react';
import { useTranslationCredentials } from '../../context/useCred';
import { getDeepLUsage } from '../../services/translationService';
import type { DeepLUsageResponse } from '../../types/deepl';
import Cred from '../TranslationPanel/Cred';
import './TranslationSettingsDrawer.scss';

interface TranslationSettingsDrawerProps {
  readonly autoFocusApiKey: boolean;
  readonly onClose: () => void;
}

export default function TranslationSettingsDrawer({
  autoFocusApiKey,
  onClose,
}: TranslationSettingsDrawerProps) {
  const drawerRef = useRef<HTMLElement | null>(null);
  const [usage, setUsage] = useState<DeepLUsageResponse | null>(null);
  const [usageError, setUsageError] = useState<string | null>(null);
  const {
    deeplApiKey,
    setDeepLApiKey,
    clearDeepLApiKey,
    getDeepLApiKey,
  } = useTranslationCredentials();
  const hasDeepLApiKey = deeplApiKey.trim().length > 0;
  const characterCount = usage?.api_key_character_count ?? usage?.character_count;
  const characterLimit = usage?.api_key_character_limit ?? usage?.character_limit;
  const usagePercent =
    characterCount !== undefined && characterLimit
      ? Math.min(100, (characterCount / characterLimit) * 100)
      : 0;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const apiKey = getDeepLApiKey();
    let isCurrent = true;

    if (!apiKey) {
      return;
    }

    const loadUsage = async (): Promise<void> => {
      try {
        const nextUsage = await getDeepLUsage(apiKey);
        if (isCurrent) {
          setUsage(nextUsage);
          setUsageError(null);
        }
      } catch {
        if (isCurrent) {
          setUsage(null);
          setUsageError('Usage could not be refreshed.');
        }
      }
    };

    void loadUsage();
    return () => {
      isCurrent = false;
    };
  }, [getDeepLApiKey]);

  return (
    <aside
      ref={drawerRef}
      className="translation-settings-drawer"
      aria-labelledby="translation-settings-title"
    >
      <header className="translation-settings-drawer__header">
        <div>
          <p className="translation-settings-drawer__eyebrow">Configuration</p>
          <h2 id="translation-settings-title" className="translation-settings-drawer__title">
            Translation settings
          </h2>
        </div>
        <button
          type="button"
          className="translation-settings-drawer__close"
          aria-label="Close translation settings"
          onClick={onClose}
        >
          ×
        </button>
      </header>

      <section className="translation-settings-drawer__provider">
        <span>Translation provider</span>
        <strong>DeepL</strong>
        <p>Translations are sent through the app's secure DeepL proxy.</p>
      </section>

      <Cred
        deeplApiKey={deeplApiKey}
        hasDeepLApiKey={hasDeepLApiKey}
        isDisabled={false}
        setDeepLApiKey={setDeepLApiKey}
        clearDeepLApiKey={() => {
          setUsage(null);
          setUsageError(null);
          clearDeepLApiKey();
        }}
        autoFocusApiKey={autoFocusApiKey}
      />

      {(usage || usageError) && (
        <section className="translation-settings-drawer__usage">
          <p className="translation-settings-drawer__section-label">DeepL usage</p>
          {usage && characterCount !== undefined && characterLimit !== undefined && (
            <>
              <p className="translation-settings-drawer__usage-value">
                <strong>{characterCount.toLocaleString()}</strong>
                {' / '}
                {characterLimit.toLocaleString()} max characters
              </p>
              <div className="translation-settings-drawer__usage-track" aria-hidden="true">
                <span style={{ width: `${usagePercent}%` }} />
              </div>
              <p className="translation-settings-drawer__usage-remaining">
                {Math.max(0, characterLimit - characterCount).toLocaleString()} remaining
              </p>
            </>
          )}
          {usageError && <p className="translation-settings-drawer__usage-error">{usageError}</p>}
        </section>
      )}
    </aside>
  );
}
