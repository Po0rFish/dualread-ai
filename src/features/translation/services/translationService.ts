import { deeplProvider } from './providers/deeplProvider';
import { mockProvider } from './providers/mockProvider';
import { openAiProvider } from './providers/openAiProvider';
import type {
  TranslateTextParams,
  TranslateTextResult,
} from '../types/service';

const createUnsupportedProviderError = (provider: never): Error => {
  return new Error(
    `Unsupported translation provider "${String(provider)}".`,
  );
};

export const translateText = async ({
  sourceText,
  targetLanguage,
  provider,
}: TranslateTextParams): Promise<TranslateTextResult> => {
  const params = {
    sourceText,
    targetLanguage,
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