import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  TranslationCredentialsContext,
  type TranslationCredentialsContextValue,
} from './ctx';
import type { TranslationProvider } from '../types/service';

interface TranslationCredentialsProviderProps {
  readonly children: ReactNode;
}

export const TranslationCredentialsProvider = ({
  children,
}: TranslationCredentialsProviderProps) => {
  const [deeplApiKey, setDeeplApiKey] = useState('');

  const setDeepLApiKey = useCallback((apiKey: string): void => {
    setDeeplApiKey(apiKey);
  }, []);

  const clearDeepLApiKey = useCallback((): void => {
    setDeeplApiKey('');
  }, []);

  const getApiKeyForProvider = useCallback(
    (provider: TranslationProvider): string | undefined => {
      if (provider === 'deepl') {
        return deeplApiKey.trim();
      }

      return undefined;
    },
    [deeplApiKey],
  );

  const contextValue = useMemo<TranslationCredentialsContextValue>(() => {
    return {
      deeplApiKey,
      setDeepLApiKey,
      clearDeepLApiKey,
      getApiKeyForProvider,
    };
  }, [
    clearDeepLApiKey,
    deeplApiKey,
    getApiKeyForProvider,
    setDeepLApiKey,
  ]);

  return (
    <TranslationCredentialsContext.Provider value={contextValue}>
      {children}
    </TranslationCredentialsContext.Provider>
  );
};
