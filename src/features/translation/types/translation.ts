export type TranslationSourceType = 'segment' | 'word' | 'custom';

export type TranslationLanguage = 'english';

export interface TranslationItem {
  readonly id: string;
  readonly sourceText: string;
  readonly sourceType: TranslationSourceType;

  readonly pageNumber?: number;
  readonly segmentId?: string;
}

export interface TranslationResult {
  readonly id: string;
  readonly itemId: string;
  readonly translatedText: string;
  readonly targetLanguage: TranslationLanguage;
}