import { translationConfig } from '../config/translationConfig';
import type { TranslationProvider } from '../types/service';

const STORAGE_KEY = 'dualread-ai:translation-provider';

const isTranslationProvider = (
  value: string | null,
): value is TranslationProvider => {
  return translationConfig.providerOptions.some((option) => {
    return option.value === value;
  });
};

export const getStoredTranslationProvider = (): TranslationProvider => {
  const storedValue = localStorage.getItem(STORAGE_KEY);

  if (isTranslationProvider(storedValue)) {
    return storedValue;
  }

  return translationConfig.defaultProvider;
};

export const setStoredTranslationProvider = (
  provider: TranslationProvider,
): void => {
  localStorage.setItem(STORAGE_KEY, provider);
};