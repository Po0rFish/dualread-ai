import { useMemo, useState } from 'react';
import type { ClassifiedPdfTextSegment } from '../../../shared/types/reader';
import { buildTextAnalysis, getWordContextByWordId, type TextAnalysisPage, type TextWord } from '../../text-analysis';

interface TextInspectorProps {
  readonly pageNumber: number;
  readonly segments: ClassifiedPdfTextSegment[];
}

interface InspectorWordProps {
  readonly word: TextWord;
  readonly selected: boolean;
  readonly onSelect: (wordId: string) => void;
}

function InspectorWord({ word, selected, onSelect }: InspectorWordProps) {
  return (
    <button
      type="button"
      style={{ margin: 2 }}
      aria-pressed={selected}
      onClick={() => onSelect(word.id)}
    >
      {word.text} <small>[{word.startIndex}, {word.endIndex})</small>
    </button>
  );
}

function InspectorContent({ pageNumber, segments }: TextInspectorProps) {
  const [selection, setSelection] = useState<{
    readonly model: readonly TextAnalysisPage[];
    readonly wordId: string;
  } | null>(null);
  const entries = useMemo(() => {
    if (typeof Intl.Segmenter !== 'function') return null;
    return buildTextAnalysis(segments.flatMap((segment) => segment.lines));
  }, [segments]);
  const handleSelectWord = (wordId: string): void => {
    setSelection(entries ? { model: entries, wordId } : null);
  };
  const selected = selection && selection.model === entries
    ? getWordContextByWordId(entries, selection.wordId)
    : null;

  if (!entries?.length) {
    return <p>{entries
      ? `No text model available for page ${pageNumber}.`
      : 'No text model available: Intl.Segmenter is unavailable in this browser.'}</p>;
  }

  return (
    <div style={{ maxHeight: 480, overflow: 'auto', overflowWrap: 'anywhere' }}>
      <p>Paragraphs are layout-based candidates. Offsets: UTF-16 within reconstructed page text, end exclusive.</p>
      <details>
        <summary>Page text (reading order)</summary>
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {entries.map((page) => page.text).join('\n\n')}
        </pre>
      </details>
      <h4>Selected word context</h4>
      {selected ? (
        <dl>
          <dt>Word</dt><dd>{selected.word.text}</dd>
          <dt>Page</dt><dd>{selected.pageNumber}</dd>
          <dt>Word offsets</dt><dd>[{selected.word.startIndex}, {selected.word.endIndex})</dd>
          <dt>Sentence</dt><dd>{selected.sentence.text}</dd>
          <dt>Sentence offsets</dt><dd>[{selected.sentence.startIndex}, {selected.sentence.endIndex})</dd>
          <dt>Paragraph candidate</dt><dd>{selected.paragraph.text}</dd>
          <dt>Paragraph offsets</dt><dd>[{selected.paragraph.startIndex}, {selected.paragraph.endIndex})</dd>
          <dt>Previous sentence</dt><dd>{selected.previousSentence?.text ?? 'None'}</dd>
          <dt>Next sentence</dt><dd>{selected.nextSentence?.text ?? 'None'}</dd>
        </dl>
      ) : <p>{selection
        ? 'No context found in the current text model. Select a word below.'
        : 'No word selected. Select a word below to inspect its context.'}</p>}
      {entries.map((page) => (<details key={page.id} open>
        <summary>Page {page.pageNumber} · {page.paragraphs.length} paragraphs</summary>
        {page.paragraphs.map((paragraph, index) => (
        <details key={paragraph.id}>
          <summary>Paragraph {index + 1} · {paragraph.sentences.length} sentences</summary>
          <p>{paragraph.text}</p>
          <ol>
            {paragraph.sentences.map((sentence) => (
              <li key={sentence.id}>
                <p>{sentence.text} <small>[{sentence.startIndex}, {sentence.endIndex})</small></p>
                <p>Words ({sentence.words.length})</p>
                {sentence.words.map((word) => (
                  <InspectorWord
                    key={word.id}
                    word={word}
                    selected={selected?.word === word}
                    onSelect={handleSelectWord}
                  />
                ))}
              </li>
            ))}
          </ol>
        </details>
        ))}</details>
      ))}
    </div>
  );
}

export default function TextInspector(props: TextInspectorProps) {
  const [open, setOpen] = useState(false);
  return (
    <details onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>Text Inspector · Intl.Segmenter (de)</summary>
      {open && <InspectorContent {...props} />}
    </details>
  );
}
