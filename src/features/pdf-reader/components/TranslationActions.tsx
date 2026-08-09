import type { TranslationSourceSegment } from '../../translation/types/segment';

interface TranslationActionsProps {
  readonly translationSegment: TranslationSourceSegment | null;
  readonly onAddToTranslation: (
    segment: TranslationSourceSegment | null,
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
        Add to translation
      </button>
    </div>
  );
}
