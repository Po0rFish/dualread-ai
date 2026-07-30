import type { ClassifiedPdfTextSegment } from '../../../shared/types/reader';

interface TranslationActionsProps {
  readonly translationSegment: ClassifiedPdfTextSegment | null;
  readonly onAddToTranslation: (
    segment: ClassifiedPdfTextSegment | null,
  ) => void;
}

export default function TranslationActions({
  translationSegment,
  onAddToTranslation,
}: TranslationActionsProps) {
  return (
    <div className="pdf-document-reader__toolbar">
      <button
        type="button"
        className="pdf-document-reader__add-translation-button"
        onClick={() => {
          onAddToTranslation(translationSegment);
        }}
        disabled={!translationSegment}
      >
        Add selected sentence to translation
      </button>
    </div>
  );
}