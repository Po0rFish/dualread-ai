import type {
  TranslationCacheItem,
  TranslationLanguage,
} from '../types/cache';
import type { TranslationSourceSegment } from '../types/segment';
import type { TranslationProvider } from '../types/service';
import type {
  TranslationItem,
  TranslationSourceType,
} from '../types/translation';
import { createTranslationItemId } from './translationItemIds';

interface CreateTranslationItemParams {
  readonly segment: TranslationSourceSegment;
  readonly cachedTranslation: TranslationCacheItem | null;
  readonly targetLanguage: TranslationLanguage;
  readonly provider: TranslationProvider;
}

const getSourceType = (
  segment: TranslationSourceSegment,
): TranslationSourceType => {
  if (segment.sourceTextHash) {
    return 'sentence';
  }

  return 'segment';
};

export const createTranslationItem = ({
  segment,
  cachedTranslation,
  targetLanguage,
  provider,
}: CreateTranslationItemParams): TranslationItem => {
  return {
    id: createTranslationItemId({
      segment,
      targetLanguage,
      provider,
    }),
    sourceText: segment.text,
    sourceType: getSourceType(segment),
    translatedText: cachedTranslation?.translatedText ?? null,
    translationStatus: cachedTranslation ? 'cached' : 'idle',
    translationError: null,
    targetLanguage,
    provider,
    documentId: segment.documentId,
    sourceTextHash: segment.sourceTextHash,
    pageNumber: segment.pageNumber,
  };
};