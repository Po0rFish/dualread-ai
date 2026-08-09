import { useCallback, useState } from 'react';
import type { ClassifiedPdfTextSegment } from '../../../shared/types/reader';
import TranslationPanel from '../../translation/components/TranslationPanel';
import { useTranslationItems } from '../../translation/hooks/useTranslationItems';
import { usePdfNav } from '../hooks/usePdfNav';
import { useTextSelection } from '../hooks/useTextSelection';
import PdfPageCanvas from './PdfPageCanvas';
import ReaderNav from './ReaderNav';
import TranslationActions from './TranslationActions';
import { useTranslationProvider } from '../../translation/hooks/useTranslationProvider';
import type { TranslationProvider } from '../../translation/types/service';
interface PdfDocumentReaderProps {
  readonly file: File;
  readonly documentId?: string;
}

export default function PdfDocumentReader({
  file,
  documentId,
}: PdfDocumentReaderProps) {
  const [selectedSegment, setSelectedSegment] =
    useState<ClassifiedPdfTextSegment | null>(null);

  const handlePageChange = useCallback((): void => {
    setSelectedSegment(null);
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
  const { selectedProvider, providerOptions, selectProvider } = useTranslationProvider();

  const {
    translationItems,
    addSegmentToTranslation,
    updateTranslationItem,
    markTranslationItemError,
    removeTranslationItem,
    clearTranslationItems,
  } = useTranslationItems({
    provider: selectedProvider,
  });

  const {
    selectedSentence,
    translationSegment,
    textModelStatus,
    sentencesCount,
  } = useTextSelection({
    documentId,
    file,
    selectedSegment,
  });
  const handleProviderChange = useCallback(
    (provider: TranslationProvider): void => {
      if (provider === selectedProvider) {
        return;
      }

      clearTranslationItems();
      setSelectedSegment(null);
      selectProvider(provider);
    },
    [clearTranslationItems, selectProvider, selectedProvider],
  );
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
      <ReaderNav
        currentPageNumber={currentPageNumber}
        pagesCount={pagesCount}
        pageInputValue={pageInputValue}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
        onPageInputChange={setPageInputValue}
        onGoToPage={goToPage}
      />

      <TranslationActions
        translationSegment={translationSegment}
        onAddToTranslation={addSegmentToTranslation}
      />

      <div className="pdf-document-reader__content">
        <div className="pdf-document-reader__pages">
          <PdfPageCanvas
            file={file}
            pageNumber={currentPageNumber}
            selectedSegmentId={selectedSegment?.id ?? null}
            onSelectSegment={setSelectedSegment}
          />
        </div>
        <TranslationPanel
          items={translationItems}
          selectedProvider={selectedProvider}
          providerOptions={providerOptions}
          onProviderChange={handleProviderChange}
          onUpdateItem={updateTranslationItem}
          onMarkItemError={markTranslationItemError}
          onRemoveItem={removeTranslationItem}
          onClearItems={clearTranslationItems}
        />
      </div>
    </section>
  );
}
