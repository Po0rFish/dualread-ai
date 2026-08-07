import type {
  TranslationProvider,
  TranslationProviderOption,
} from '../types/service';

interface TranslationConfig {
  readonly defaultProvider: TranslationProvider;
  readonly providerOptions: TranslationProviderOption[];
}

export const translationConfig: TranslationConfig = {
  defaultProvider: 'mock',
  providerOptions: [
    {
      value: 'mock',
      label: 'Mock',
      description: 'Local mock translation for development.',
    },
    {
      value: 'deepl',
      label: 'DeepL',
      description: 'DeepL provider placeholder.',
    },
  ],
};