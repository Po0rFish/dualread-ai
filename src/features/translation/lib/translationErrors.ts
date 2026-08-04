import type { TranslationProvider } from '../types/service';

interface CreateProviderNotImplementedErrorParams {
  readonly provider: TranslationProvider;
  readonly details?: string;
}

interface CreateMissingApiKeyErrorParams {
  readonly provider: TranslationProvider;
}

interface CreateTranslationRequestErrorParams {
  readonly provider: TranslationProvider;
  readonly status: number;
}

interface CreateUnexpectedResponseErrorParams {
  readonly provider: TranslationProvider;
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

export const createMissingApiKeyError = ({
  provider,
}: CreateMissingApiKeyErrorParams): Error => {
  return new Error(`${provider} API key is missing.`);
};

export const createTranslationRequestError = ({
  provider,
  status,
}: CreateTranslationRequestErrorParams): Error => {
  return new Error(
    `${provider} translation request failed with status ${status}.`,
  );
};

export const createUnexpectedResponseError = ({
  provider,
}: CreateUnexpectedResponseErrorParams): Error => {
  return new Error(`${provider} response has unexpected format.`);
};