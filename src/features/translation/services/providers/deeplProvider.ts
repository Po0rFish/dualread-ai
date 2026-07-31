import type {
  TranslateTextResult,
  TranslationProviderTranslateParams,
} from '../../types/service';

export const deeplProvider = {
  async translate({
    sourceText,
    targetLanguage,
  }: TranslationProviderTranslateParams): Promise<TranslateTextResult> {
    throw new Error(
      `DeepL provider is not implemented yet for target language "${targetLanguage}". Source text length: ${sourceText.length}.`,
    );
  },
};