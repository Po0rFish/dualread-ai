import { useEffect, useRef, useState } from 'react';
import type { RenderTask } from 'pdfjs-dist';
import type { ClassifiedPdfTextSegment } from '../../../shared/types/reader';
import { buildReadingSegments } from '../lib/buildReadingSegments';
import { buildTextLines } from '../lib/buildTextLines';
import { classifyTextSegments } from '../lib/classifyTextSegments';
import { extractPdfText } from '../lib/extractPdfText';
import { pdfjsLib } from '../lib/pdfjsClient';
import SegmentOverlay from './SegmentOverlay';

interface PdfPageCanvasProps {
  readonly file: File;
  readonly pageNumber: number;
  readonly selectedSegmentId: string | null;
  readonly onSelectSegment: (segment: ClassifiedPdfTextSegment) => void;
}

interface CanvasSize {
  readonly width: number;
  readonly height: number;
}

const RENDER_SCALE = 1.5;

export default function PdfPageCanvas({
  file,
  pageNumber,
  selectedSegmentId,
  onSelectSegment,
}: PdfPageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [classifiedSegments, setClassifiedSegments] = useState<
    ClassifiedPdfTextSegment[]
  >([]);

  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    let isCancelled = false;
    let renderTask: RenderTask | null = null;

    const renderPdfPage = async (): Promise<void> => {
      try {
        const canvas = canvasRef.current;

        if (!canvas) {
          return;
        }

        setClassifiedSegments([]);
        setCanvasSize({
          width: 0,
          height: 0,
        });

        const arrayBuffer = await file.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
        });

        const pdfDocument = await loadingTask.promise;

        if (isCancelled) {
          return;
        }

        const page = await pdfDocument.getPage(pageNumber);

        if (isCancelled) {
          return;
        }

        const renderViewport = page.getViewport({
          scale: RENDER_SCALE,
        });

        const baseViewport = page.getViewport({
          scale: 1,
        });

        const context = canvas.getContext('2d');

        if (!context) {
          console.error('[PdfPageCanvas] Canvas context not found');
          return;
        }

        canvas.width = renderViewport.width;
        canvas.height = renderViewport.height;

        setCanvasSize({
          width: renderViewport.width,
          height: renderViewport.height,
        });

        context.clearRect(0, 0, canvas.width, canvas.height);

        renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport: renderViewport,
        });

        await renderTask.promise;

        if (isCancelled) {
          return;
        }

        const tokens = await extractPdfText({
          page,
          pageNumber,
          pageHeight: baseViewport.height,
        });

        const lines = buildTextLines(tokens);
        const readingSegments = buildReadingSegments(lines);

        const nextClassifiedSegments = classifyTextSegments({
          segments: readingSegments,
          pageHeight: baseViewport.height,
        });

        if (isCancelled) {
          return;
        }

        setClassifiedSegments(nextClassifiedSegments);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error('[PdfPageCanvas] Render error:', error);
      }
    };

    void renderPdfPage();

    return () => {
      isCancelled = true;

      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [file, pageNumber]);

  const handleSelectSegment = (
    segment: ClassifiedPdfTextSegment,
  ): void => {
    onSelectSegment(segment);
  };

  return (
    <div
      className="pdf-page-canvas"
      style={{
        position: 'relative',
        width: canvasSize.width,
        height: canvasSize.height,
      }}
    >
      <canvas
        ref={canvasRef}
        className="pdf-page-canvas__canvas"
        style={{
          display: 'block',
        }}
      />

      <SegmentOverlay
        segments={classifiedSegments}
        selectedSegmentId={selectedSegmentId}
        renderScale={RENDER_SCALE}
        onSelectSegment={handleSelectSegment}
      />
    </div>
  );
}