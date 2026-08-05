import type { TranslationLanguage } from '../types/cache';

export const DEEPL_PROVIDER_NAME = 'DeepL';

export const DEEPL_TRANSLATE_PROXY_URL = '/api/translate/deepl';

export const deeplTargetLanguageMap: Record<TranslationLanguage, string> = {
  english: 'EN',
};

export const getDeepLTargetLanguage = (
  targetLanguage: TranslationLanguage,
): string => {
  return deeplTargetLanguageMap[targetLanguage];
};