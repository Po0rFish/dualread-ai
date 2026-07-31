import type { TranslationLanguage } from '../types/cache';
import type { TranslationSourceSegment } from '../types/segment';
import type { TranslationProvider } from '../types/service';

interface CreateTranslationItemIdParams {
  readonly segment: TranslationSourceSegment;
  readonly targetLanguage: TranslationLanguage;
  readonly provider: TranslationProvider;
}

export const createTranslationItemId = ({
  segment,
  targetLanguage,
  provider,
}: CreateTranslationItemIdParams): string => {
  if (segment.documentId && segment.sourceTextHash) {
    return `${segment.documentId}:${segment.sourceTextHash}:${targetLanguage}:${provider}`;
  }

  return `${segment.id}:${targetLanguage}:${provider}`;
};