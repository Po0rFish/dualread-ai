import { DEEPL_TRANSLATE_PROXY_URL } from '../../config/deeplConfig';
import { createDeepLProxyRequestInit } from '../../lib/deepl/api';
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

    const proxyRequestInit = createDeepLProxyRequestInit({
      sourceText,
      targetLanguage,
      apiKey: trimmedApiKey,
    });

    throw createProviderNotImplementedError({
      provider: 'deepl',
      details: `Proxy request is prepared for "${DEEPL_TRANSLATE_PROXY_URL}". Method "${proxyRequestInit.method ?? 'POST'}". Source text length: ${sourceText.length}.`,
    });
  },
};