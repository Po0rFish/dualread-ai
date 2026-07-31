import type { TranslationLanguage } from './cache';

export type { TranslationLanguage } from './cache';

export type TranslationSourceType =
  | 'segment'
  | 'sentence'
  | 'word'
  | 'custom';

export type TranslationItemStatus =
  | 'idle'
  | 'cached'
  | 'translated'
  | 'error';

export interface TranslationItem {
  readonly id: string;
  readonly sourceText: string;
  readonly sourceType: TranslationSourceType;
  readonly translatedText: string | null;
  readonly translationStatus: TranslationItemStatus;
  readonly targetLanguage: TranslationLanguage;

  readonly documentId?: string;
  readonly sourceTextHash?: string;
  readonly pageNumber?: number;
}

export interface TranslationResult {
  readonly sourceText: string;
  readonly translatedText: string;
  readonly targetLanguage: TranslationLanguage;
}