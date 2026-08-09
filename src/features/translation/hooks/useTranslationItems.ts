import { useCallback, useState } from 'react';
import { createTranslationItem } from '../lib/createTranslationItem';
import { cacheRepo } from '../repositories/cacheRepo';
import type { TranslationLanguage } from '../types/cache';
import type { TranslationSourceSegment } from '../types/segment';
import type { TranslationProvider } from '../types/service';
import type { TranslationItem } from '../types/translation';

interface CacheableTranslationItem extends TranslationItem {
  readonly documentId: string;
  readonly sourceTextHash: string;
}

interface UseTranslationItemsParams {
  readonly provider: TranslationProvider;
}

interface UseTranslationItemsResult {
  readonly translationItems: TranslationItem[];
  readonly addSegmentToTranslation: (
    segment: TranslationSourceSegment | null,
  ) => void;
  readonly updateTranslationItem: (
    itemId: string,
    translatedText: string,
  ) => Promise<void>;
  readonly markTranslationItemError: (
    itemId: string,
    errorMessage: string,
  ) => void;
  readonly removeTranslationItem: (itemId: string) => void;
  readonly clearTranslationItems: () => void;
}

const TARGET_LANGUAGE: TranslationLanguage = 'english';

const isCacheableTranslationItem = (
  item: TranslationItem | null,
): item is CacheableTranslationItem => {
  return Boolean(item?.documentId && item.sourceTextHash);
};

export const useTranslationItems = ({
  provider,
}: UseTranslationItemsParams): UseTranslationItemsResult => {
  const [translationItems, setTranslationItems] = useState<
    TranslationItem[]
  >([]);

  const addTranslationItem = useCallback((item: TranslationItem): void => {
    setTranslationItems((currentItems) => {
      const itemExists = currentItems.some((currentItem) => {
        return currentItem.id === item.id;
      });

      if (itemExists) {
        return [
          item,
          ...currentItems.filter((currentItem) => {
            return currentItem.id !== item.id;
          }),
        ];
      }

      return [item, ...currentItems];
    });
  }, []);

  const addSegmentToTranslation = useCallback(
    (segment: TranslationSourceSegment | null): void => {
      if (!segment) {
        return;
      }

      const pendingItem = createTranslationItem({
        segment,
        cachedTranslation: null,
        targetLanguage: TARGET_LANGUAGE,
        provider,
      });

      addTranslationItem(pendingItem);

      const loadCachedTranslation = async (): Promise<void> => {
        const cachedTranslation =
          segment.documentId && segment.sourceTextHash
            ? await cacheRepo.get({
              documentId: segment.documentId,
              sourceTextHash: segment.sourceTextHash,
              targetLanguage: TARGET_LANGUAGE,
              provider,
            })
            : null;

        const validCachedTranslation =
          cachedTranslation?.provider === provider
            ? cachedTranslation
            : null;

        if (!validCachedTranslation) {
          return;
        }

        const cachedItem = createTranslationItem({
          segment,
          cachedTranslation: validCachedTranslation,
          targetLanguage: TARGET_LANGUAGE,
          provider,
        });

        setTranslationItems((currentItems) => {
          return currentItems.map((currentItem) => {
            return currentItem.id === cachedItem.id
              ? cachedItem
              : currentItem;
          });
        });
      };

      void loadCachedTranslation();
    },
    [addTranslationItem, provider],
  );

  const updateTranslationItem = useCallback(
    async (itemId: string, translatedText: string): Promise<void> => {
      const itemToCache =
        translationItems.find((item) => {
          return item.id === itemId;
        }) ?? null;

      setTranslationItems((currentItems) => {
        return currentItems.map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          return {
            ...item,
            translatedText,
            translationStatus: 'translated',
            translationError: null,
            provider,
          };
        });
      });

      if (!isCacheableTranslationItem(itemToCache)) {
        return;
      }

      await cacheRepo.save({
        documentId: itemToCache.documentId,
        sourceText: itemToCache.sourceText,
        sourceTextHash: itemToCache.sourceTextHash,
        targetLanguage: itemToCache.targetLanguage,
        provider,
        translatedText,
      });
    },
    [provider, translationItems],
  );

  const markTranslationItemError = useCallback(
    (itemId: string, errorMessage: string): void => {
      setTranslationItems((currentItems) => {
        return currentItems.map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          return {
            ...item,
            translationStatus: 'error',
            translationError: errorMessage,
            provider,
          };
        });
      });
    },
    [provider],
  );

  const removeTranslationItem = useCallback((itemId: string): void => {
    setTranslationItems((currentItems) => {
      return currentItems.filter((item) => {
        return item.id !== itemId;
      });
    });
  }, []);

  const clearTranslationItems = useCallback((): void => {
    setTranslationItems([]);
  }, []);

  return {
    translationItems,
    addSegmentToTranslation,
    updateTranslationItem,
    markTranslationItemError,
    removeTranslationItem,
    clearTranslationItems,
  };
};
