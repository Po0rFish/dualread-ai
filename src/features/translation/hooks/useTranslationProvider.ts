import { useCallback, useState } from 'react';
import { translationConfig } from '../config/translationConfig';
import {
  getStoredTranslationProvider,
  setStoredTranslationProvider,
} from '../storage/providerStorage';
import type {
  TranslationProvider,
  TranslationProviderOption,
} from '../types/service';

interface UseTranslationProviderResult {
  readonly selectedProvider: TranslationProvider;
  readonly providerOptions: TranslationProviderOption[];
  readonly selectProvider: (provider: TranslationProvider) => void;
}

export const useTranslationProvider =
  (): UseTranslationProviderResult => {
    const [selectedProvider, setSelectedProvider] =
      useState<TranslationProvider>(() => {
        return getStoredTranslationProvider();
      });

    const selectProvider = useCallback(
      (provider: TranslationProvider): void => {
        setSelectedProvider(provider);
        setStoredTranslationProvider(provider);
      },
      [],
    );

    return {
      selectedProvider,
      providerOptions: translationConfig.providerOptions,
      selectProvider,
    };
  };