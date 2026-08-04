import { createDeepLRequestBody } from '../../lib/deepl/api';
import {
  createMissingApiKeyError,
  createProviderNotImplementedError,
} from '../../lib/translationErrors';
import type {
  TranslateTextResult,
  TranslationProviderTranslateParams,
} from '../../types/service';

export const deeplProvider = {
  async translate({
    sourceText,
    targetLanguage,
    apiKey,
  }: TranslationProviderTranslateParams): Promise<TranslateTextResult> {
    const trimmedApiKey = apiKey?.trim();

    if (!trimmedApiKey) {
      throw createMissingApiKeyError({
        provider: 'deepl',
      });
    }

    const requestBody = createDeepLRequestBody({
      sourceText,
      targetLanguage,
    });

    throw createProviderNotImplementedError({
      provider: 'deepl',
      details: `API key is provided. Target language "${requestBody.target_lang}". Source text length: ${sourceText.length}.`,
    });
  },
};