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

interface CreateTranslationItemIdParams {
  readonly segment: TranslationSourceSegment;
  readonly targetLanguage: TranslationLanguage;
  readonly provider: TranslationProvider;
}

interface CreateTranslationItemParams {
  readonly segment: TranslationSourceSegment;
  readonly cachedTranslation: TranslationCacheItem | null;
  readonly targetLanguage: TranslationLanguage;
  readonly provider: TranslationProvider;
}

const createTranslationItemId = ({
  segment,
  targetLanguage,
  provider,
}: CreateTranslationItemIdParams): string => {
  if (segment.documentId && segment.sourceTextHash) {
    return `${segment.documentId}:${segment.sourceTextHash}:${targetLanguage}:${provider}`;
  }

  return `${segment.id}:${targetLanguage}:${provider}`;
};

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