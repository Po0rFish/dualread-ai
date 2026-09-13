import type { TranslationLanguage } from './cache';
import type { TranslationProvider } from './service';

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

export interface TranslationPart {
  readonly source: string;
  readonly meaning: string;
}

export interface TranslationItem {
  readonly byParts?: readonly TranslationPart[];
  readonly id: string;
  readonly sourceText: string;
  readonly sourceType: TranslationSourceType;
  readonly translatedText: string | null;
  readonly translationStatus: TranslationItemStatus;
  readonly translationError: string | null;
  readonly targetLanguage: TranslationLanguage;
  readonly provider: TranslationProvider;

  readonly documentId?: string;
  readonly sourceTextHash?: string;
  readonly pageNumber?: number;
}

export interface TranslationResult {
  readonly sourceText: string;
  readonly translatedText: string;
  readonly targetLanguage: TranslationLanguage;
}
