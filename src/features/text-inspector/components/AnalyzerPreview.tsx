import { useState } from 'react';
import { analyzeWithMock, createAiAnalyzerRequestFromWordContext, type AiAnalyzerResponse } from '../../ai-analyzer';
import type { TextWordContext } from '../../text-analysis';

export default function AnalyzerPreview({ context }: { readonly context: TextWordContext | null }) {
  const [result, setResult] = useState<{
    readonly word: TextWordContext['word'];
    readonly response: AiAnalyzerResponse;
  } | null>(null);
  const response = context && result?.word === context.word ? result.response : null;

  return (
    <section aria-label="AI analyzer preview (mock)">
      <h4>AI analyzer preview (mock)</h4>
      <p>Diagnostic sample data only. No AI provider is called.</p>
      {context ? (
        <button type="button" onClick={() => setResult({
          word: context.word,
          response: analyzeWithMock(createAiAnalyzerRequestFromWordContext(context)),
        })}>Analyze word</button>
      ) : <p>Select a word to analyze it.</p>}
      <div aria-live="polite">
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
