import type {
  TranslateTextParams,
  TranslateTextResult,
} from '../types/service';
import { deeplProvider } from './providers/deeplProvider';
import { mockProvider } from './providers/mockProvider';
import { openAiProvider } from './providers/openAiProvider';

const createUnsupportedProviderError = (provider: never): Error => {
  return new Error(
    `Unsupported translation provider "${String(provider)}".`,
  );
};

export const translateText = async ({
  sourceText,
  targetLanguage,
  provider,
  apiKey,
}: TranslateTextParams): Promise<TranslateTextResult> => {
  const params = {
    sourceText,
    targetLanguage,
    apiKey,
  };

  if (provider === 'mock') {
    return mockProvider.translate(params);
  }

  if (provider === 'deepl') {
    return deeplProvider.translate(params);
  }

  if (provider === 'openai') {
    return openAiProvider.translate(params);
  }

  throw createUnsupportedProviderError(provider);
};