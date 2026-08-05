import { getDeepLTargetLanguage } from '../../config/deeplConfig';
import type { TranslationLanguage } from '../../types/cache';

import type {
  DeepLProxyErrorResponse,
  DeepLTranslateRequestBody,
  DeepLTranslateResponse,
  DeepLTranslationResponseItem,
} from '../../types/deepl';

interface CreateDeepLRequestBodyParams {
  readonly sourceText: string;
  readonly targetLanguage: TranslationLanguage;
}

interface CreateDeepLProxyRequestInitParams
  extends CreateDeepLRequestBodyParams {
  readonly apiKey: string;
}

const DEEPL_AUTH_HEADER_PREFIX = 'DeepL-Auth-Key';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isDeepLTranslationResponseItem = (
  value: unknown,
): value is DeepLTranslationResponseItem => {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.text !== 'string') {
    return false;
  }

  if (
    value.detected_source_language !== undefined &&
    typeof value.detected_source_language !== 'string'
  ) {
    return false;
  }

  if (
    value.billed_characters !== undefined &&
    typeof value.billed_characters !== 'number'
  ) {
    return false;
  }

  return true;
};

export const createDeepLRequestBody = ({
  sourceText,
  targetLanguage,
}: CreateDeepLRequestBodyParams): DeepLTranslateRequestBody => {
  return {
    text: [sourceText],
    target_lang: getDeepLTargetLanguage(targetLanguage),
    show_billed_characters: true,
  };
};

export const createDeepLProxyRequestInit = ({
  sourceText,
  targetLanguage,
  apiKey,
}: CreateDeepLProxyRequestInitParams): RequestInit => {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${DEEPL_AUTH_HEADER_PREFIX} ${apiKey}`,
    },
    body: JSON.stringify(
      createDeepLRequestBody({
        sourceText,
        targetLanguage,
      }),
    ),
  };
};

export const isDeepLTranslateResponse = (
  value: unknown,
): value is DeepLTranslateResponse => {
  if (!isRecord(value)) {
    return false;
  }

  if (!Array.isArray(value.translations)) {
    return false;
  }

  if (value.translations.length === 0) {
    return false;
  }

  return value.translations.every(isDeepLTranslationResponseItem);
};

export const isDeepLProxyErrorResponse = (
  value: unknown,
): value is DeepLProxyErrorResponse => {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.error !== 'string') {
    return false;
  }

  if (
    value.status !== undefined &&
    typeof value.status !== 'number'
  ) {
    return false;
  }

  if (
    value.details !== undefined &&
    typeof value.details !== 'string'
  ) {
    return false;
  }

  return true;
};

export const getDeepLTranslatedText = (
  response: DeepLTranslateResponse,
): string => {
  const translatedText = response.translations[0]?.text.trim();

  if (!translatedText) {
    throw new Error('DeepL response does not contain translated text.');
  }

  return translatedText;
};