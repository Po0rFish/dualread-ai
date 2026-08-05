import type {
  TranslationProvider,
  TranslationProviderOption,
} from '../../types/service';

interface ProviderProps {
  readonly selectedProvider: TranslationProvider;
  readonly providerOptions: TranslationProviderOption[];
  readonly onProviderChange: (provider: TranslationProvider) => void;
}

export default function Provider({
  selectedProvider,
  providerOptions,
  onProviderChange,
}: ProviderProps) {
  const selectedProviderDescription =
    providerOptions.find((option) => {
      return option.value === selectedProvider;
    })?.description ?? '';

  return (
    <div className="translation-panel__provider">
      <label className="translation-panel__provider-label">
        <span className="translation-panel__provider-text">
          Translation provider
        </span>

        <select
          className="translation-panel__provider-select"
          value={selectedProvider}
          onChange={(event) => {
            onProviderChange(event.target.value as TranslationProvider);
          }}
        >
          {providerOptions.map((option) => {
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </select>
      </label>

      {selectedProviderDescription && (
        <p className="translation-panel__provider-description">
          {selectedProviderDescription}
        </p>
      )}
    </div>
  );
}