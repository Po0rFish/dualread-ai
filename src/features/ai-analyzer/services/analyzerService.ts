import type { AiAnalyzerProvider, AiAnalyzerProviderAnalyzeParams, AiAnalyzerRequest, AiAnalyzerResponse } from '../types';
import { analyzeWithMock } from './providers/mockProvider';
import { analyzeWithProxy } from './providers/proxyProvider';

const providers: Record<AiAnalyzerProvider, (request: AiAnalyzerRequest) => AiAnalyzerResponse | Promise<AiAnalyzerResponse>> = {
  mock: analyzeWithMock,
  proxy: analyzeWithProxy,
};

/** Local mock remains the default; proxy requires explicit selection. */
export async function analyzeTextWithAiAnalyzer({
  request,
  provider = 'mock',
}: AiAnalyzerProviderAnalyzeParams): Promise<AiAnalyzerResponse> {
  return providers[provider](request);
}
