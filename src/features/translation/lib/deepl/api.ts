import { getDeepLTargetLanguage } from '../../config/deeplConfig';
import type { TranslationLanguage } from '../../types/cache';
import type {
  DeepLTranslateRequestBody,
  DeepLTranslateResponse,
  DeepLTranslationResponseItem,
} from '../../types/deepl';

interface CreateDeepLRequestBodyParams {
  readonly sourceText: string;
  readonly targetLanguage: TranslationLanguage;
}

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

export const getDeepLTranslatedText = (
  response: DeepLTranslateResponse,
): string => {
  const translatedText = response.translations[0]?.text.trim();

  if (!translatedText) {
    throw new Error('DeepL response does not contain translated text.');
  }

  return translatedText;
};