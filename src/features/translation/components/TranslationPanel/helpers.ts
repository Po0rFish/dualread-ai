import type { TranslationItem } from '../../types/translation';

export const DEEPL_API_KEY_HELP_URL =
  'https://support.deepl.com/hc/en-us/articles/360020695820-API-key-for-DeepL-API';

export const getTranslateButtonText = (
  item: TranslationItem,
  isTranslating: boolean,
): string => {
  if (isTranslating && item.translationStatus === 'error') {
    return 'Retrying...';
  }

  if (isTranslating) {
    return 'Translating...';
  }

  if (item.translationStatus === 'error') {
    return 'Retry';
  }

  return 'Translate';
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Translation failed.';
};
