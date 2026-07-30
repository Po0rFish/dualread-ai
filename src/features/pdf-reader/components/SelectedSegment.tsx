import type { ClassifiedPdfTextSegment } from '../../../shared/types/reader';

interface SelectedSegmentProps {
  readonly selectedSegment: ClassifiedPdfTextSegment | null;
}

export default function SelectedSegment({
  selectedSegment,
}: SelectedSegmentProps) {
  return (
    <section className="pdf-document-reader__selected-segment">
      <h2 className="pdf-document-reader__selected-segment-title">
        Selected segment
      </h2>

      {!selectedSegment && (
        <p className="pdf-document-reader__selected-segment-empty">
          No segment selected.
        </p>
      )}

      {selectedSegment && (
        <article className="pdf-document-reader__selected-segment-card">
          <small className="pdf-document-reader__selected-segment-meta">
            {selectedSegment.type} · page {selectedSegment.pageNumber}
          </small>

          <p className="pdf-document-reader__selected-segment-text">
            {selectedSegment.text}
          </p>
        </article>
      )}
    </section>
  );
}