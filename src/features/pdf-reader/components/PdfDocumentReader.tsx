import { useCallback, useEffect, useRef, useState } from 'react';
import type { PdfTextSelection } from '../lib/resolveAnalysisSentence';
import TranslationPanel from '../../translation/components/TranslationPanel';
import TranslationSettingsDrawer from '../../translation/components/TranslationSettingsDrawer';
import { useTranslationItems } from '../../translation/hooks/useTranslationItems';
import { usePdfNav } from '../hooks/usePdfNav';
import { useTextSelection } from '../hooks/useTextSelection';
import PdfPageCanvas from './PdfPageCanvas';
import ReaderNav from './ReaderNav';
import './PdfDocumentReader.scss';

interface PdfDocumentReaderProps {
  readonly file: File;
  readonly documentId?: string;
}

export default function PdfDocumentReader({
  file,
  documentId,
}: PdfDocumentReaderProps) {
  const [selectedSegment, setSelectedSegment] =
    useState<PdfTextSelection | null>(null);
  const [activeRightPanel, setActiveRightPanel] = useState<'translation' | 'settings' | null>(null);
  const [shouldFocusApiKey, setShouldFocusApiKey] = useState(false);
  const addedTranslationKeyRef = useRef<string | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const settingsTriggerRef = useRef<HTMLElement | null>(null);

  const handlePageChange = useCallback((): void => {
    setSelectedSegment(null);
    setActiveRightPanel((panel) => panel === 'translation' ? null : panel);
  }, []);

  const {
    pagesCount,
    currentPageNumber,
    pageInputValue,
    setPageInputValue,
    goToPreviousPage,
    goToNextPage,
    goToPage,
  } = usePdfNav({
    file,
    documentId,
    onPageChange: handlePageChange,
  });
  const {
    translationItems,
    addSegmentToTranslation,
    updateTranslationItem,
    markTranslationItemError,
  } = useTranslationItems({
    provider: 'deepl',
  });

  const {
    selectedSentence,
    translationSegment,
    textModelStatus,
    sentencesCount,
  } = useTextSelection({
    documentId,
    file,
    selection: selectedSegment,
  });

  useEffect(() => {
    if (!translationSegment) {
      addedTranslationKeyRef.current = null;
      return;
    }

    const translationKey = `${translationSegment.id}:${translationSegment.sourceTextHash ?? ''}:deepl`;

    if (addedTranslationKeyRef.current === translationKey) {
      return;
    }

    addedTranslationKeyRef.current = translationKey;
    addSegmentToTranslation(translationSegment);
  }, [addSegmentToTranslation, translationSegment]);

  const activeTranslationItem = translationSegment
    ? translationItems.find((item) => {
        if (
          translationSegment.sourceTextHash &&
          item.sourceTextHash === translationSegment.sourceTextHash
        ) {
          return item.provider === 'deepl';
        }

        return (
          item.sourceText === translationSegment.text &&
          item.pageNumber === translationSegment.pageNumber &&
          item.provider === 'deepl'
        );
      }) ?? null
    : null;
  const openSettings = useCallback((focusApiKey = false): void => {
    settingsTriggerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : settingsButtonRef.current;
    setShouldFocusApiKey(focusApiKey);
    setActiveRightPanel('settings');
  }, []);

  const closePanel = useCallback((): void => {
    setActiveRightPanel(null);
    setShouldFocusApiKey(false);
    window.requestAnimationFrame(() => {
      const trigger = settingsTriggerRef.current;
      settingsTriggerRef.current = null;

      if (trigger?.isConnected) {
        trigger.focus({ preventScroll: true });
      } else {
        settingsButtonRef.current?.focus({ preventScroll: true });
      }
    });
  }, []);
  return (
    <section
      className="pdf-document-reader"
      data-text-model-status={textModelStatus}
      data-text-model-sentences-count={sentencesCount}
      data-selected-sentence-id={selectedSentence?.id ?? ''}
      data-selected-sentence-parts-count={
        selectedSentence?.parts.length ?? 0
      }
    >
      <div className="pdf-document-reader__controls">
        <ReaderNav
          currentPageNumber={currentPageNumber}
          pagesCount={pagesCount}
          pageInputValue={pageInputValue}
          onPreviousPage={goToPreviousPage}
          onNextPage={goToNextPage}
          onPageInputChange={setPageInputValue}
          onGoToPage={goToPage}
        />
        <button
          ref={settingsButtonRef}
          type="button"
          className="pdf-document-reader__settings-button"
          aria-expanded={activeRightPanel === 'settings'}
          aria-controls="translation-settings-drawer"
          onClick={() => openSettings()}
        >
          Settings
        </button>
      </div>

      <div className="pdf-document-reader__content">
        <div className="pdf-document-reader__pages">
          <PdfPageCanvas
            file={file}
            pageNumber={currentPageNumber}
            selectedSentence={selectedSegment?.sentence ?? null}
            onSelectSegment={(selection) => {
              setSelectedSegment(selection);
              setShouldFocusApiKey(false);
              setActiveRightPanel('translation');
            }}
          />
        </div>
        <div
          className="pdf-document-reader__translation-panel"
          data-open={activeRightPanel !== null}
          inert={activeRightPanel === null}
          aria-hidden={activeRightPanel === null}
        >
          {activeRightPanel === 'translation' && (
            <div className="pdf-document-reader__panel-view">
              <TranslationPanel
                item={activeTranslationItem}
                onUpdateItem={updateTranslationItem}
                onMarkItemError={markTranslationItemError}
                onOpenSettings={openSettings}
                onClose={closePanel}
              />
            </div>
          )}
          {activeRightPanel === 'settings' && (
            <div id="translation-settings-drawer" className="pdf-document-reader__panel-view">
              <TranslationSettingsDrawer
                autoFocusApiKey={shouldFocusApiKey}
                onClose={closePanel}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
