import type { TranslationProvider } from './service';

export type TranslationLanguage = 'english';

export interface TranslationCacheItem {
  readonly id: string;
  readonly documentId: string;
  readonly sourceText: string;
  readonly sourceTextHash: string;
  readonly targetLanguage: TranslationLanguage;
  readonly provider: TranslationProvider;
  readonly translatedText: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SaveTranslationParams {
  readonly documentId: string;
  readonly sourceText: string;
  readonly sourceTextHash: string;
  readonly targetLanguage: TranslationLanguage;
  readonly provider: TranslationProvider;
  readonly translatedText: string;
}

export interface GetTranslationParams {
  readonly documentId: string;
  readonly sourceTextHash: string;
  readonly targetLanguage: TranslationLanguage;
  readonly provider: TranslationProvider;
}

export interface DeleteTranslationsByDocumentParams {
  readonly documentId: string;
}