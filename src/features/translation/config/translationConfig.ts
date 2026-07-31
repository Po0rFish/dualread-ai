import type { TranslationProvider } from '../types/service';

interface TranslationConfig {
  readonly defaultProvider: TranslationProvider;
}

export const translationConfig: TranslationConfig = {
  defaultProvider: 'mock',
};