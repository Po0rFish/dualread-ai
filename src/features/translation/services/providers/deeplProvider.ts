import { DEEPL_TRANSLATE_PROXY_URL } from '../../config/deeplConfig';
import {
  createDeepLProxyRequestInit,
  getDeepLTranslatedText,
  isDeepLTranslateResponse,
} from '../../lib/deepl/api';
import {
  createMissingApiKeyError,
  createTranslationNetworkError,
  createTranslationRequestError,
  createUnexpectedResponseError,
} from '../../lib/translationErrors';
import type {
  TranslateTextResult,
  TranslationProviderTranslateParams,
} from '../../types/service';

const DEEPL_PROVIDER = 'deepl';

const requestDeepLTranslation = async (
  requestInit: RequestInit,
): Promise<Response> => {
  try {
    return await fetch(DEEPL_TRANSLATE_PROXY_URL, requestInit);
  } catch {
    throw createTranslationNetworkError({
      provider: DEEPL_PROVIDER,
    });
  }
};

const readResponseData = async (
  response: Response,
): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    throw createUnexpectedResponseError({
      provider: DEEPL_PROVIDER,
    });
  }
};

export const deeplProvider = {
  async translate({
    sourceText,
    targetLanguage,
    apiKey,
  }: TranslationProviderTranslateParams): Promise<TranslateTextResult> {
    const trimmedApiKey = apiKey?.trim();

    if (!trimmedApiKey) {
      throw createMissingApiKeyError({
        provider: DEEPL_PROVIDER,
      });
    }

    const response = await requestDeepLTranslation(
      createDeepLProxyRequestInit({
        sourceText,
        targetLanguage,
        apiKey: trimmedApiKey,
      }),
    );

    if (!response.ok) {
      throw createTranslationRequestError({
        provider: DEEPL_PROVIDER,
        status: response.status,
      });
    }

    const responseData = await readResponseData(response);

    if (!isDeepLTranslateResponse(responseData)) {
      throw createUnexpectedResponseError({
        provider: DEEPL_PROVIDER,
      });
    }

    return {
      sourceText,
      translatedText: getDeepLTranslatedText(responseData),
      targetLanguage,
      provider: DEEPL_PROVIDER,
    };
  },
};