import { AI_ANALYZER_PROXY_URL } from '../../config/aiAnalyzerConfig';
import { createAiAnalyzerProxyRequestBody, isAiAnalyzerResponse } from '../../lib/api';
import type { AiAnalyzerRequest, AiAnalyzerResponse } from '../../types';

export async function analyzeWithProxy(request: AiAnalyzerRequest): Promise<AiAnalyzerResponse> {
  let response: Response;
  try {
    response = await fetch(AI_ANALYZER_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createAiAnalyzerProxyRequestBody(request)),
      mode: 'same-origin',
      redirect: 'error',
    });
  } catch {
    throw new Error('Could not reach the AI analyzer proxy. Please try again.');
  }
  if (!response.ok) {
    throw new Error(response.status === 501
      ? 'AI analyzer proxy is not implemented yet.'
      : `AI analyzer request failed (HTTP ${response.status}). Please try again.`);
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error('AI analyzer proxy returned an invalid response.');
  }
  if (!isAiAnalyzerResponse(body) || body.selectedText !== request.selectedText) {
    throw new Error('AI analyzer proxy returned an invalid response.');
  }
  return body;
}
