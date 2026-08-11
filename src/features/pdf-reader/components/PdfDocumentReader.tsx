import { useCallback, useEffect, useRef, useState } from 'react';
import type { ClassifiedPdfTextSegment } from '../../../shared/types/reader';
import TranslationPopover from '../../translation/components/TranslationPopover';
import { useTranslationItems } from '../../translation/hooks/useTranslationItems';
import { usePdfNav } from '../hooks/usePdfNav';
import { useTextSelection } from '../hooks/useTextSelection';
import PdfPageCanvas from './PdfPageCanvas';
import ReaderNav from './ReaderNav';
import { useTranslationProvider } from '../../translation/hooks/useTranslationProvider';
import type { TranslationProvider } from '../../translation/types/service';
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
    useState<ClassifiedPdfTextSegment | null>(null);
  const addedTranslationKeyRef = useRef<string | null>(null);

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

  useEffect(() => {
    if (!translationSegment) {
      addedTranslationKeyRef.current = null;
      return;
    }

    const translationKey = `${translationSegment.id}:${translationSegment.sourceTextHash ?? ''}:${selectedProvider}`;

    if (addedTranslationKeyRef.current === translationKey) {
      return;
    }

    addedTranslationKeyRef.current = translationKey;
    addSegmentToTranslation(translationSegment);
  }, [addSegmentToTranslation, selectedProvider, translationSegment]);

  const activeTranslationItem = translationSegment
    ? translationItems.find((item) => {
        if (
          translationSegment.sourceTextHash &&
          item.sourceTextHash === translationSegment.sourceTextHash
        ) {
          return item.provider === selectedProvider;
        }

        return (
          item.sourceText === translationSegment.text &&
          item.pageNumber === translationSegment.pageNumber &&
          item.provider === selectedProvider
        );
      }) ?? null
    : null;
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

      </div>

      <div className="pdf-document-reader__content">
        <div className="pdf-document-reader__pages">
          <PdfPageCanvas
            file={file}
            pageNumber={currentPageNumber}
            selectedSegmentId={selectedSegment?.id ?? null}
            onSelectSegment={setSelectedSegment}
            translationPopover={
              selectedSegment ? (
                <TranslationPopover
                  item={activeTranslationItem}
                  selectedProvider={selectedProvider}
                  providerOptions={providerOptions}
                  onProviderChange={handleProviderChange}
                  onUpdateItem={updateTranslationItem}
                  onMarkItemError={markTranslationItemError}
                  onClose={() => {
                    setSelectedSegment(null);
                  }}
                />
              ) : null
            }
          />
        </div>
      </div>
    </section>
  );
}
