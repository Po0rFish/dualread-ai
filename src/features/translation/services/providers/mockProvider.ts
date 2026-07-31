import { mockTranslateText } from '../mockTranslator';
import type {
  TranslateTextResult,
  TranslationProviderTranslateParams,
} from '../../types/service';

export const mockProvider = {
  async translate({
    sourceText,
    targetLanguage,
  }: TranslationProviderTranslateParams): Promise<TranslateTextResult> {
    const translatedText = await mockTranslateText({
      sourceText,
      targetLanguage,
    });

    return {
      sourceText,
      translatedText,
      targetLanguage,
      provider: 'mock',
    };
  },
};