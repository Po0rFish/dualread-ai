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

  const getDeepLApiKey = useCallback((): string | undefined => {
    return deeplApiKey.trim() || undefined;
  }, [deeplApiKey]);

  const contextValue = useMemo<TranslationCredentialsContextValue>(() => {
    return {
      deeplApiKey,
      setDeepLApiKey,
      clearDeepLApiKey,
      getDeepLApiKey,
    };
  }, [
    clearDeepLApiKey,
    deeplApiKey,
    getDeepLApiKey,
    setDeepLApiKey,
  ]);

  return (
    <TranslationCredentialsContext.Provider value={contextValue}>
      {children}
    </TranslationCredentialsContext.Provider>
  );
};
