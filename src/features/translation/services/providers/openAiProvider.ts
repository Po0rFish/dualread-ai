import type {
  TranslateTextResult,
  TranslationProviderTranslateParams,
} from '../../types/service';

export const openAiProvider = {
  async translate({
    sourceText,
    targetLanguage,
  }: TranslationProviderTranslateParams): Promise<TranslateTextResult> {
    throw new Error(
      `OpenAI provider is not implemented yet for target language "${targetLanguage}". Source text length: ${sourceText.length}.`,
    );
  },
};