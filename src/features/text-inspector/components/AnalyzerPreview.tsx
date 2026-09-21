import { useRef, useState } from 'react';
import { analyzeTextWithAiAnalyzer, createAiAnalyzerRequestFromWordContext, type AiAnalyzerResponse } from '../../ai-analyzer';
import type { TextWordContext } from '../../text-analysis';

export default function AnalyzerPreview({ context }: { readonly context: TextWordContext | null }) {
  const [result, setResult] = useState<{
    readonly word: TextWordContext['word'];
    readonly response: AiAnalyzerResponse | null;
    readonly loading: boolean;
    readonly error: string | null;
  } | null>(null);
  const requestId = useRef(0);
  const current = result?.word === context?.word ? result : null;
  const response = result?.word === context?.word ? result?.response ?? null : null;

  const analyze = async (): Promise<void> => {
    if (!context) return;
    const id = ++requestId.current;
    const word = context.word;
    setResult({ word, response: null, loading: true, error: null });
    try {
      const next = await analyzeTextWithAiAnalyzer({ request: createAiAnalyzerRequestFromWordContext(context) });
      if (id === requestId.current) setResult({ word, response: next, loading: false, error: null });
    } catch {
      if (id === requestId.current) setResult({
        word, response: null, loading: false, error: 'Analysis could not be completed. Please try again.',
      });
    }
  };

  return (
    <section aria-label="AI analyzer preview (mock)">
      <h4>AI analyzer preview (mock)</h4>
      <p>Diagnostic sample data only. No AI provider is called.</p>
      {context ? (
        <button type="button" disabled={current?.loading} onClick={() => { void analyze(); }}>
          {current?.loading ? 'Analyzing…' : 'Analyze word'}
        </button>
      ) : <p>Select a word to analyze it.</p>}
      <div aria-live="polite">
        {current?.error && <p role="alert">{current.error}</p>}
        {response && (
          <dl>
            <dt>Selected text</dt><dd>{response.selectedText}</dd>
            <dt>Base meaning</dt><dd>{response.baseMeaning}</dd>
            <dt>Meaning in context</dt><dd>{response.meaningInContext}</dd>
            {([
              ['Grammar notes', response.grammarNotes],
              ['Examples', response.examples],
              ['Warnings', response.warnings],
            ] as const).map(([label, items]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : 'None'}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
