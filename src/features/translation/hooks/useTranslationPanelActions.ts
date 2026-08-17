import { useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../components/TranslationPanel/helpers';
import { translateText } from '../services/translationService';
import type { TranslationItem } from '../types/translation';

interface UseTranslationPanelActionsParams {
  readonly isDeepLReady: boolean;
  readonly getDeepLApiKey: () => string | undefined;
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
  isDeepLReady,
  getDeepLApiKey,
  onUpdateItem,
  onMarkItemError,
}: UseTranslationPanelActionsParams) => {
  const activeItemIdsRef = useRef(new Set<string>());
  const copyFeedbackTimerRef = useRef<number | null>(null);
  const [translatingItemIds, setTranslatingItemIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [copiedTextKey, setCopiedTextKey] = useState<string | null>(null);
  const [copyErrorTextKey, setCopyErrorTextKey] = useState<string | null>(null);

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

  const handleCopy = (text: string, feedbackKey: string): void => {
    if (!text) {
      return;
    }

    const copyText = async (): Promise<void> => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedTextKey(feedbackKey);
        setCopyErrorTextKey(null);

        if (copyFeedbackTimerRef.current !== null) {
          window.clearTimeout(copyFeedbackTimerRef.current);
        }

        copyFeedbackTimerRef.current = window.setTimeout(() => {
          setCopiedTextKey((currentTextKey) =>
            currentTextKey === feedbackKey ? null : currentTextKey,
          );
          copyFeedbackTimerRef.current = null;
        }, 1200);
      } catch {
        setCopiedTextKey(null);
        setCopyErrorTextKey(feedbackKey);
      }
    };

    void copyText();
  };

  const handleTranslate = (item: TranslationItem): void => {
    if (
      !isDeepLReady ||
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
          provider: 'deepl',
          apiKey: getDeepLApiKey(),
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
    copiedTextKey,
    copyErrorTextKey,
    isItemTranslating,
    handleCopy,
    handleTranslate,
  };
};
