import type { ClassifiedPdfTextSegment } from '../../../shared/types/reader';
import type { PdfSentence } from '../types/documentText';

interface SelectedSentenceProps {
  readonly selectedSegment: ClassifiedPdfTextSegment | null;
  readonly selectedSentence: PdfSentence | null;
  readonly textModelStatus: string;
  readonly sentencesCount: number;
  readonly isTextModelLoading: boolean;
}

export default function SelectedSentence({
  selectedSegment,
  selectedSentence,
  textModelStatus,
  sentencesCount,
  isTextModelLoading,
}: SelectedSentenceProps) {
  return (
    <section className="pdf-document-reader__selected-sentence">
      <h2 className="pdf-document-reader__selected-sentence-title">
        Selected sentence
      </h2>

      <p className="pdf-document-reader__selected-sentence-meta">
        Text model: {textModelStatus} · Sentences: {sentencesCount}
      </p>

      {!selectedSegment && (
        <p className="pdf-document-reader__selected-sentence-empty">
          No segment selected.
        </p>
      )}

      {selectedSegment && isTextModelLoading && (
        <p className="pdf-document-reader__selected-sentence-empty">
          Building text model...
        </p>
      )}

      {selectedSegment && !isTextModelLoading && !selectedSentence && (
        <p className="pdf-document-reader__selected-sentence-empty">
          Sentence was not found for selected segment.
        </p>
      )}

      {selectedSentence && (
        <article className="pdf-document-reader__selected-sentence-card">
          <small className="pdf-document-reader__selected-sentence-meta">
            {selectedSentence.id} · parts:{' '}
            {selectedSentence.parts.length}
          </small>

          <p className="pdf-document-reader__selected-sentence-text">
            {selectedSentence.text}
          </p>
        </article>
      )}
    </section>
  );
}