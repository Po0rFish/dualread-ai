import { useCallback, useState } from 'react';
import type { ClassifiedPdfTextSegment } from '../../../shared/types/reader';
import TranslationPanel from '../../translation/components/TranslationPanel';
import { useTranslationItems } from '../../translation/hooks/useTranslationItems';
import { usePdfNav } from '../hooks/usePdfNav';
import { useTextSelection } from '../hooks/useTextSelection';
import PdfPageCanvas from './PdfPageCanvas';
import ReaderNav from './ReaderNav';
import SelectedSegment from './SelectedSegment';
import SelectedSentence from './SelectedSentence';
import TranslationActions from './TranslationActions';

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

  const {
    translationItems,
    addSegmentToTranslation,
    removeTranslationItem,
    clearTranslationItems,
  } = useTranslationItems();

  const {
    selectedSentence,
    translationSegment,
    textModelStatus,
    sentencesCount,
    isTextModelLoading,
  } = useTextSelection({
    documentId,
    file,
    selectedSegment,
  });

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
      <header className="pdf-document-reader__header">
        <h1 className="pdf-document-reader__title">PDF Reader</h1>
      </header>

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

      <SelectedSegment selectedSegment={selectedSegment} />

      <SelectedSentence
        selectedSegment={selectedSegment}
        selectedSentence={selectedSentence}
        textModelStatus={textModelStatus}
        sentencesCount={sentencesCount}
        isTextModelLoading={isTextModelLoading}
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
          onRemoveItem={removeTranslationItem}
          onClearItems={clearTranslationItems}
        />
      </div>
    </section>
  );
}