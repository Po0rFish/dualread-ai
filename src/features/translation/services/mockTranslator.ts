import type { TranslationLanguage } from '../types/translation';

interface MockTranslateTextParams {
  readonly text: string;
  readonly targetLanguage: TranslationLanguage;
}

const MOCK_TRANSLATION_DELAY_MS = 500;

export const mockTranslateText = async ({
  text,
  targetLanguage,
}: MockTranslateTextParams): Promise<string> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, MOCK_TRANSLATION_DELAY_MS);
  });

  return `[Mock translation to ${targetLanguage}]: ${text}`;
};