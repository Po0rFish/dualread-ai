import type { TranslationProvider } from '../types/service';

interface CreateProviderNotImplementedErrorParams {
  readonly provider: TranslationProvider;
  readonly details?: string;
}

export const createProviderNotImplementedError = ({
  provider,
  details,
}: CreateProviderNotImplementedErrorParams): Error => {
  const message = details
    ? `${provider} provider is not implemented yet. ${details}`
    : `${provider} provider is not implemented yet.`;

  return new Error(message);
};