import { createContext } from 'react';

export interface TranslationCredentialsContextValue {
  readonly deeplApiKey: string;
  readonly setDeepLApiKey: (apiKey: string) => void;
  readonly clearDeepLApiKey: () => void;
  readonly getDeepLApiKey: () => string | undefined;
}

export const TranslationCredentialsContext =
  createContext<TranslationCredentialsContextValue | null>(null);
