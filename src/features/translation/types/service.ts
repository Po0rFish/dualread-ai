import type { TranslationLanguage } from './cache';

export type TranslationProvider = 'deepl';

export interface TranslationProviderTranslateParams {
  readonly sourceText: string;
  readonly targetLanguage: TranslationLanguage;
  readonly apiKey?: string;
}

export interface TranslateTextParams
  extends TranslationProviderTranslateParams {
  readonly provider: TranslationProvider;
}

export interface TranslateTextResult {
  readonly sourceText: string;
  readonly translatedText: string;
  readonly targetLanguage: TranslationLanguage;
  readonly provider: TranslationProvider;
}
