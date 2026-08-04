import { useContext } from 'react';
import {
  TranslationCredentialsContext,
  type TranslationCredentialsContextValue,
} from './ctx';

export const useTranslationCredentials =
  (): TranslationCredentialsContextValue => {
    const context = useContext(TranslationCredentialsContext);

    if (!context) {
      throw new Error(
        'useTranslationCredentials must be used within TranslationCredentialsProvider.',
      );
    }

    return context;
  };