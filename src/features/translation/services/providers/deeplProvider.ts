import {
  DEEPL_PROVIDER_NAME,
  getDeepLTargetLanguage,
} from '../../config/deeplConfig';
import { createProviderNotImplementedError } from '../../lib/translationErrors';
import type {
  TranslateTextResult,
  TranslationProviderTranslateParams,
} from '../../types/service';

export const deeplProvider = {
  async translate({
    sourceText,
    targetLanguage,
  }: TranslationProviderTranslateParams): Promise<TranslateTextResult> {
    const deeplTargetLanguage = getDeepLTargetLanguage(targetLanguage);

    throw createProviderNotImplementedError({
      provider: 'deepl',
      details: `${DEEPL_PROVIDER_NAME} target language "${deeplTargetLanguage}". Source text length: ${sourceText.length}.`,
    });
  },
};