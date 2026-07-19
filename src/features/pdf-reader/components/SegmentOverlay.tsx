import type { CSSProperties } from 'react';
import type {
  ClassifiedPdfTextSegment,
  PdfTextRect,
} from '../../../shared/types/reader';
import './SegmentOverlay.scss';

interface SegmentOverlayProps {
  readonly segments: ClassifiedPdfTextSegment[];
  readonly selectedSegmentId: string | null;
  readonly renderScale: number;
  readonly onSelectSegment: (segment: ClassifiedPdfTextSegment) => void;
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
  selectedSegmentId,
  renderScale,
  onSelectSegment,
}: SegmentOverlayProps) {
  return (
    <div className="segment-overlay">
      {segments.map((segment) => {
        const isSelected = selectedSegmentId === segment.id;

        return segment.rects.map((rect, rectIndex) => {
          return (
            <button
              key={`${segment.id}-rect-${rectIndex + 1}`}
              type="button"
              className={getRectClassName(segment, isSelected)}
              title={`${segment.type}: ${segment.text}`}
              aria-label={`${segment.type}: ${segment.text}`}
              onClick={() => {
                onSelectSegment(segment);
              }}
              style={getRectStyle(rect, renderScale)}
            />
          );
        });
      })}
    </div>
  );
}