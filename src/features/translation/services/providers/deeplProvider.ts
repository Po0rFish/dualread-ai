import { createDeepLRequestBody } from '../../lib/deepl/api';
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
    const requestBody = createDeepLRequestBody({
      sourceText,
      targetLanguage,
    });

    throw createProviderNotImplementedError({
      provider: 'deepl',
      details: `Target language "${requestBody.target_lang}". Source text length: ${sourceText.length}.`,
    });
  },
};