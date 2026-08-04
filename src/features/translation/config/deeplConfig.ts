import type { TranslationLanguage } from '../types/cache';

export const DEEPL_PROVIDER_NAME = 'DeepL';

export const deeplTargetLanguageMap: Record<TranslationLanguage, string> = {
  english: 'EN',
};

export const getDeepLTargetLanguage = (
  targetLanguage: TranslationLanguage,
): string => {
  return deeplTargetLanguageMap[targetLanguage];
};