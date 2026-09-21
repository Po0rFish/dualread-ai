import { useMemo, type CSSProperties } from 'react';
import type { TextAnalysisPage, TextSentence } from '../../text-analysis';
import { resolveAnalysisSentence } from '../lib/resolveAnalysisSentence';
import type {
  ClassifiedPdfTextSegment,
  PdfTextRect,
  PdfTextWord,
} from '../../../shared/types/reader';
import './SegmentOverlay.scss';

interface SegmentOverlayProps {
  readonly segments: ClassifiedPdfTextSegment[];
  readonly analysis: readonly TextAnalysisPage[];
  readonly selectedSentence: TextSentence | null;
  readonly renderScale: number;
  readonly onSelectSegment: (segment: ClassifiedPdfTextSegment, word: PdfTextWord) => void;
}

const getRectStyle = (
  rect: PdfTextRect,
  renderScale: number,
): CSSProperties => {
  return {
    left: rect.x * renderScale,
    top: rect.lineY * renderScale,
    width: rect.width * renderScale,
    height: rect.height * renderScale,
  };
};

const getRectClassName = (
  segment: ClassifiedPdfTextSegment,
  isSelected: boolean,
): string => {
  const classNames = [
    'segment-overlay__rect',
    `segment-overlay__rect--${segment.type}`,
  ];

  if (isSelected) {
    classNames.push('segment-overlay__rect--selected');
  }

  return classNames.join(' ');
};

export default function SegmentOverlay({
  segments,
  analysis,
  selectedSentence,
  renderScale,
  onSelectSegment,
}: SegmentOverlayProps) {
  // Use the same mapping as clicks, including punctuation and cross-segment sentences.
  const wordSentences = useMemo(() => new Map(segments.map((segment) => [
    segment,
    segment.words.map((word) => resolveAnalysisSentence(analysis, segments, segment, word)),
  ])), [analysis, segments]);

  return (
    <div className="segment-overlay">
      {segments.map((segment) => {
        return segment.words.map((wordRect, wordIndex) => {
          const sentence = wordSentences.get(segment)?.[wordIndex];
          const isSelected = Boolean(selectedSentence && sentence &&
            sentence.id === selectedSentence.id &&
            sentence.pageNumber === selectedSentence.pageNumber);

          return (
            <button
              key={`${segment.id}-word-${wordIndex + 1}`}
              type="button"
              className={getRectClassName(segment, isSelected)}
              title={wordRect.text}
              aria-label={`Select sentence containing ${wordRect.text}`}
              onClick={() => {
                onSelectSegment(segment, wordRect);
              }}
              style={getRectStyle(wordRect, renderScale)}
            />
          );
        });
      })}
    </div>
  );
}
