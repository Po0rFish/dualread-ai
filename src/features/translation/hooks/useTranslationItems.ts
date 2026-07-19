import { useState } from 'react';
import type { ClassifiedPdfTextSegment } from '../../../shared/types/reader';
import type { TranslationItem } from '../types/translation';

interface UseTranslationItemsResult {
  readonly translationItems: TranslationItem[];
  readonly addSegmentToTranslation: (
    segment: ClassifiedPdfTextSegment | null,
  ) => void;
  readonly removeTranslationItem: (itemId: string) => void;
  readonly clearTranslationItems: () => void;
}

const buildTranslationItemFromSegment = (
  segment: ClassifiedPdfTextSegment,
): TranslationItem => {
  return {
    id: `translation-item-${segment.id}`,
    sourceText: segment.text,
    sourceType: 'segment',
    pageNumber: segment.pageNumber,
    segmentId: segment.id,
  };
};

export const useTranslationItems = (): UseTranslationItemsResult => {
  const [translationItems, setTranslationItems] = useState<
    TranslationItem[]
  >([]);

  const addSegmentToTranslation = (
    segment: ClassifiedPdfTextSegment | null,
  ): void => {
    if (!segment) {
      return;
    }

    const nextItem = buildTranslationItemFromSegment(segment);

    setTranslationItems((currentItems) => {
      const alreadyExists = currentItems.some((item) => {
        return item.id === nextItem.id;
      });

      if (alreadyExists) {
        return currentItems;
      }

      return [...currentItems, nextItem];
    });
  };

  const removeTranslationItem = (itemId: string): void => {
    setTranslationItems((currentItems) => {
      return currentItems.filter((item) => {
        return item.id !== itemId;
      });
    });
  };

  const clearTranslationItems = (): void => {
    setTranslationItems([]);
  };

  return {
    translationItems,
    addSegmentToTranslation,
    removeTranslationItem,
    clearTranslationItems,
  };
};