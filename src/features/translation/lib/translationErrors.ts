import type { TranslationProvider } from '../types/service';

interface CreateProviderNotImplementedErrorParams {
  readonly provider: TranslationProvider;
  readonly details?: string;
}

interface CreateMissingApiKeyErrorParams {
  readonly provider: TranslationProvider;
}

interface CreateTranslationNetworkErrorParams {
  readonly provider: TranslationProvider;
}

interface CreateTranslationRequestErrorParams {
  readonly provider: TranslationProvider;
  readonly status: number;
  readonly details?: string;
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

export const createTranslationNetworkError = ({
  provider,
}: CreateTranslationNetworkErrorParams): Error => {
  return new Error(
    `${provider} translation request could not be completed.`,
  );
};

export const createTranslationRequestError = ({
  provider,
  status,
  details,
}: CreateTranslationRequestErrorParams): Error => {
  const message = details
    ? `${provider} translation request failed with status ${status}. ${details}`
    : `${provider} translation request failed with status ${status}.`;

  return new Error(message);
};

export const createUnexpectedResponseError = ({
  provider,
}: CreateUnexpectedResponseErrorParams): Error => {
  return new Error(`${provider} response has unexpected format.`);
};