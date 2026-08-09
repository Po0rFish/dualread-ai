import { useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../components/TranslationPanel/helpers';
import { translateText } from '../services/translationService';
import type { TranslationProvider } from '../types/service';
import type { TranslationItem } from '../types/translation';

interface UseTranslationPanelActionsParams {
  readonly selectedProvider: TranslationProvider;
  readonly isTranslationProviderReady: boolean;
  readonly getApiKeyForProvider: (
    provider: TranslationProvider,
  ) => string | undefined;
  readonly onUpdateItem: (
    itemId: string,
    translatedText: string,
  ) => Promise<void>;
  readonly onMarkItemError: (
    itemId: string,
    errorMessage: string,
  ) => void;
}

export const useTranslationPanelActions = ({
  selectedProvider,
  isTranslationProviderReady,
  getApiKeyForProvider,
  onUpdateItem,
  onMarkItemError,
}: UseTranslationPanelActionsParams) => {
  const activeItemIdsRef = useRef(new Set<string>());
  const copyFeedbackTimerRef = useRef<number | null>(null);
  const [translatingItemIds, setTranslatingItemIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [copyErrorItemId, setCopyErrorItemId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimerRef.current !== null) {
        window.clearTimeout(copyFeedbackTimerRef.current);
      }
    };
  }, []);

  const isItemTranslating = (itemId: string): boolean => {
    return translatingItemIds.has(itemId);
  };

  const handleCopy = (item: TranslationItem): void => {
    if (!item.translatedText) {
      return;
    }

    const copyTranslation = async (): Promise<void> => {
      try {
        await navigator.clipboard.writeText(item.translatedText ?? '');
        setCopiedItemId(item.id);
        setCopyErrorItemId(null);

        if (copyFeedbackTimerRef.current !== null) {
          window.clearTimeout(copyFeedbackTimerRef.current);
        }

        copyFeedbackTimerRef.current = window.setTimeout(() => {
          setCopiedItemId((currentItemId) =>
            currentItemId === item.id ? null : currentItemId,
          );
          copyFeedbackTimerRef.current = null;
        }, 1200);
      } catch {
        setCopiedItemId(null);
        setCopyErrorItemId(item.id);
      }
    };

    void copyTranslation();
  };

  const handleTranslate = (item: TranslationItem): void => {
    if (
      !isTranslationProviderReady ||
      activeItemIdsRef.current.has(item.id)
    ) {
      return;
    }

    activeItemIdsRef.current.add(item.id);
    setTranslatingItemIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(item.id);
      return nextIds;
    });

    const translateItem = async (): Promise<void> => {
      try {
        const translationResult = await translateText({
          sourceText: item.sourceText,
          targetLanguage: item.targetLanguage,
          provider: selectedProvider,
          apiKey: getApiKeyForProvider(selectedProvider),
        });

        await onUpdateItem(item.id, translationResult.translatedText);
      } catch (error) {
        onMarkItemError(item.id, getErrorMessage(error));
      } finally {
        activeItemIdsRef.current.delete(item.id);
        setTranslatingItemIds((currentIds) => {
          const nextIds = new Set(currentIds);
          nextIds.delete(item.id);
          return nextIds;
        });
      }
    };

    void translateItem();
  };

  return {
    hasActiveTranslation: translatingItemIds.size > 0,
    copiedItemId,
    copyErrorItemId,
    isItemTranslating,
    handleCopy,
    handleTranslate,
  };
};
