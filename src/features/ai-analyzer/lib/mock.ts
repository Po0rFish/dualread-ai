import type { AiAnalyzerRequest, AiAnalyzerResponse } from '../types';

/** Fixed diagnostic fixtures, not AI-generated explanations. No network calls. */
export function analyzeWithMock(request: AiAnalyzerRequest): AiAnalyzerResponse {
  const isMond = request.selectedKind === 'word' && request.selectedText === 'Mond';
  return {
    selectedText: request.selectedText,
    baseMeaning: isMond ? 'moon' : 'No mock meaning available for this selection.',
    meaningInContext: isMond ? 'the moon (sample context)' : 'No mock context explanation available.',
    grammarNotes: isMond ? ['der Mond is masculine', 'In the sample sentence, den Mond is accusative.'] : [],
    examples: isMond ? ['Ich sehe den Mond. — I see the moon.'] : [],
    warnings: ['Mock data only. This is a fixed example, not an analysis of your sentence.'],
  };
}
