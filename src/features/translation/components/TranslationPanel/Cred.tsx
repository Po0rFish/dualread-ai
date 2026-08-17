import { useEffect, useRef } from 'react';
import { DEEPL_API_KEY_HELP_URL } from './helpers';

interface CredProps {
  readonly deeplApiKey: string;
  readonly hasDeepLApiKey: boolean;
  readonly isDisabled: boolean;
  readonly setDeepLApiKey: (apiKey: string) => void;
  readonly clearDeepLApiKey: () => void;
  readonly autoFocusApiKey?: boolean;
}

export default function Cred({
  deeplApiKey,
  hasDeepLApiKey,
  isDisabled,
  setDeepLApiKey,
  clearDeepLApiKey,
  autoFocusApiKey = false,
}: CredProps) {
  const apiKeyInputRef = useRef<HTMLInputElement | null>(null);
  const disabledTitle = isDisabled
    ? 'Wait until translation request finishes.'
    : undefined;

  useEffect(() => {
    if (autoFocusApiKey) {
      apiKeyInputRef.current?.focus();
    }
  }, [autoFocusApiKey]);

  return (
    <div className="translation-panel__credentials">
      <label className="translation-panel__credentials-label">
        <span className="translation-panel__credentials-text">
          DeepL API key
        </span>

        <input
          ref={apiKeyInputRef}
          className="translation-panel__credentials-input"
          type="text"
          name="deepl-api-key"
          id="deepl-api-key"
          value={deeplApiKey}
          title={disabledTitle}
          onChange={(event) => {
            if (isDisabled) {
              return;
            }

            setDeepLApiKey(event.target.value);
          }}
          placeholder="Paste your DeepL API key"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          data-lpignore="true"
          data-1p-ignore="true"
          disabled={isDisabled}
          autoFocus={autoFocusApiKey}
        />
      </label>

      {deeplApiKey && (
        <button
          type="button"
          className="translation-panel__credentials-clear-button"
          title={disabledTitle}
          onClick={() => {
            if (isDisabled) {
              return;
            }

            clearDeepLApiKey();
          }}
          disabled={isDisabled}
        >
          Clear key
        </button>
      )}

      <div className="translation-panel__credentials-help">
        <p className="translation-panel__credentials-hint">
          Key is kept only in memory and disappears after page reload.
        </p>

        <a
          className="translation-panel__credentials-link"
          href={DEEPL_API_KEY_HELP_URL}
          target="_blank"
          rel="noreferrer"
        >
          Where do I find my DeepL API key?
        </a>
      </div>

      {!hasDeepLApiKey && (
        <p className="translation-panel__credentials-warning">
          Enter your DeepL API key to enable translation.
        </p>
      )}
    </div>
  );
}
