import type { TranslationProvider } from './service';

export type TranslationLanguage = 'english';

export interface TranslationCacheKeyParams {
  readonly documentId: string;
  readonly sourceTextHash: string;
  readonly targetLanguage: TranslationLanguage;
  readonly provider: TranslationProvider;
}

export interface TranslationCacheItem extends TranslationCacheKeyParams {
  readonly id: string;
  readonly sourceText: string;
  readonly translatedText: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SaveTranslationParams
  extends TranslationCacheKeyParams {
  readonly sourceText: string;
  readonly translatedText: string;
}

export type GetTranslationParams = TranslationCacheKeyParams;

export interface DeleteTranslationsByDocumentParams {
  readonly documentId: string;
}