import type {
  TranslateTextParams,
  TranslateTextResult,
} from '../types/service';
import { deeplProvider } from './providers/deeplProvider';
import type { DeepLUsageResponse } from '../types/deepl';

export const translateText = async ({
  sourceText,
  targetLanguage,
  provider,
  apiKey,
}: TranslateTextParams): Promise<TranslateTextResult> => {
  return deeplProvider.translate({
    sourceText,
    targetLanguage,
    apiKey,
  }).then((result) => ({ ...result, provider }));
};

export const getDeepLUsage = async (
  apiKey: string,
): Promise<DeepLUsageResponse> => {
  return deeplProvider.getUsage(apiKey);
};
