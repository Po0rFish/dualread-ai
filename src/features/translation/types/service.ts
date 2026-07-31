import type { TranslationLanguage } from './cache';

export type TranslationProvider = 'mock' | 'deepl' | 'openai';

export interface TranslationProviderOption {
  readonly value: TranslationProvider;
  readonly label: string;
  readonly description: string;
}

export interface TranslationProviderTranslateParams {
  readonly sourceText: string;
  readonly targetLanguage: TranslationLanguage;
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