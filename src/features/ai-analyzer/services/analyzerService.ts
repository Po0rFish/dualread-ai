import type { AiAnalyzerProvider, AiAnalyzerProviderAnalyzeParams, AiAnalyzerRequest, AiAnalyzerResponse } from '../types';
import { analyzeWithMock } from './providers/mockProvider';

const providers: Record<AiAnalyzerProvider, (request: AiAnalyzerRequest) => AiAnalyzerResponse> = {
  mock: analyzeWithMock,
};

/** Local mock is the only provider; callers need not select it. */
export function analyzeTextWithAiAnalyzer({
  request,
  provider = 'mock',
}: AiAnalyzerProviderAnalyzeParams): AiAnalyzerResponse {
  return providers[provider](request);
}
