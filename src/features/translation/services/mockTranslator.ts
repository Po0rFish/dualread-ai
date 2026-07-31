import type { TranslationLanguage } from '../types/cache';

interface MockTranslateParams {
  readonly sourceText: string;
  readonly targetLanguage: TranslationLanguage;
}

const MOCK_TRANSLATION_DELAY = 250;

export const mockTranslateText = async ({
  sourceText,
}: MockTranslateParams): Promise<string> => {
  await new Promise((resolve) => {
    setTimeout(resolve, MOCK_TRANSLATION_DELAY);
  });

  return `[Mock translation] ${sourceText}`;
};