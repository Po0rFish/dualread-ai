import { createProviderNotImplementedError } from '../../lib/translationErrors';
import type {
  TranslateTextResult,
  TranslationProviderTranslateParams,
} from '../../types/service';

export const openAiProvider = {
  async translate({
    sourceText,
    targetLanguage,
  }: TranslationProviderTranslateParams): Promise<TranslateTextResult> {
    throw createProviderNotImplementedError({
      provider: 'openai',
      details: `Target language "${targetLanguage}". Source text length: ${sourceText.length}.`,
    });
  },
};