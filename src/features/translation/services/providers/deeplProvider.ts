import { DEEPL_TRANSLATE_PROXY_URL } from '../../config/deeplConfig';
import {
  createDeepLProxyRequestInit,
  createDeepLUsageProxyRequestInit,
  getDeepLTranslatedText,
  isDeepLProxyErrorResponse,
  isDeepLTranslateResponse,
  isDeepLUsageResponse,
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
import type { DeepLUsageResponse } from '../../types/deepl';

const DEEPL_PROVIDER = 'deepl';

const requestDeepLProxy = async (
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

const readErrorResponseData = async (
  response: Response,
): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getRequestErrorDetails = async (
  response: Response,
): Promise<string | undefined> => {
  const responseData = await readErrorResponseData(response);

  if (!isDeepLProxyErrorResponse(responseData)) {
    return undefined;
  }

  const details = responseData.details ?? responseData.error;
  const trimmedDetails = details.trim();

  if (!trimmedDetails) {
    return undefined;
  }

  return trimmedDetails;
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

    const response = await requestDeepLProxy(
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
        details: await getRequestErrorDetails(response),
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

  async getUsage(apiKey: string): Promise<DeepLUsageResponse> {
    const trimmedApiKey = apiKey.trim();

    if (!trimmedApiKey) {
      throw createMissingApiKeyError({
        provider: DEEPL_PROVIDER,
      });
    }

    const response = await requestDeepLProxy(
      createDeepLUsageProxyRequestInit(trimmedApiKey),
    );

    if (!response.ok) {
      throw createTranslationRequestError({
        provider: DEEPL_PROVIDER,
        status: response.status,
        details: await getRequestErrorDetails(response),
      });
    }

    const responseData = await readResponseData(response);

    if (!isDeepLUsageResponse(responseData)) {
      throw createUnexpectedResponseError({
        provider: DEEPL_PROVIDER,
      });
    }

    return responseData;
  },
};
