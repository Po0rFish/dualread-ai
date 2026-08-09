import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react';

const DEFAULT_PANEL_WIDTH = 420;
const MIN_PANEL_WIDTH = 320;
const MAX_PANEL_WIDTH = 600;
const PANEL_WIDTH_STORAGE_KEY = 'dualread.translationPanelWidth';

interface UseTranslationPanelResizeResult {
  readonly containerRef: RefObject<HTMLDivElement | null>;
  readonly panelWidth: number;
  readonly startResize: () => void;
  readonly resetWidth: () => void;
  readonly handleResizeKeyDown: (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => void;
}

const clampWidth = (width: number, maxWidth = MAX_PANEL_WIDTH): number => {
  return Math.min(maxWidth, Math.max(MIN_PANEL_WIDTH, width));
};

const getInitialPanelWidth = (): number => {
  const storedValue = window.localStorage.getItem(PANEL_WIDTH_STORAGE_KEY);

  if (storedValue === null) {
    return DEFAULT_PANEL_WIDTH;
  }

  const storedWidth = Number(storedValue);

  return Number.isFinite(storedWidth)
    ? clampWidth(storedWidth)
    : DEFAULT_PANEL_WIDTH;
};

const savePanelWidth = (width: number): void => {
  window.localStorage.setItem(
    PANEL_WIDTH_STORAGE_KEY,
    String(Math.round(width)),
  );
};

export const useTranslationPanelResize = (): UseTranslationPanelResizeResult => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelWidthRef = useRef(DEFAULT_PANEL_WIDTH);
  const [panelWidth, setPanelWidth] = useState(getInitialPanelWidth);
  const [isResizing, setIsResizing] = useState(false);

  const updatePanelWidth = (width: number): void => {
    panelWidthRef.current = width;
    setPanelWidth(width);
  };

  useEffect(() => {
    panelWidthRef.current = panelWidth;
  }, [panelWidth]);

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handlePointerMove = (event: PointerEvent): void => {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      const containerBounds = container.getBoundingClientRect();
      const availableWidth = Math.max(
        MIN_PANEL_WIDTH,
        Math.min(MAX_PANEL_WIDTH, containerBounds.width * 0.45),
      );
      const nextWidth = containerBounds.right - event.clientX;

      updatePanelWidth(clampWidth(nextWidth, availableWidth));
    };

    const handlePointerUp = (): void => {
      savePanelWidth(panelWidthRef.current);
      setIsResizing(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
    document.body.classList.add('is-resizing-translation-panel');

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.classList.remove('is-resizing-translation-panel');
    };
  }, [isResizing]);

  const resetWidth = (): void => {
    updatePanelWidth(DEFAULT_PANEL_WIDTH);
    savePanelWidth(DEFAULT_PANEL_WIDTH);
  };

  const startResize = (): void => {
    setIsResizing(true);
  };

  const handleResizeKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ): void => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();
    const direction = event.key === 'ArrowLeft' ? 1 : -1;
    const nextWidth = clampWidth(panelWidthRef.current + direction * 16);

    updatePanelWidth(nextWidth);
    savePanelWidth(nextWidth);
  };

  return {
    containerRef,
    panelWidth,
    startResize,
    resetWidth,
    handleResizeKeyDown,
  };
};
