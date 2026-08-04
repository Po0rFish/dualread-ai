import { createContext } from 'react';
import type { TranslationProvider } from '../types/service';

export interface TranslationCredentialsContextValue {
  readonly deeplApiKey: string;
  readonly setDeepLApiKey: (apiKey: string) => void;
  readonly clearDeepLApiKey: () => void;
  readonly getApiKeyForProvider: (
    provider: TranslationProvider,
  ) => string | undefined;
}

export const TranslationCredentialsContext =
  createContext<TranslationCredentialsContextValue | null>(null);