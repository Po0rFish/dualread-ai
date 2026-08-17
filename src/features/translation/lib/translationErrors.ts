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

const getProviderLabel = (provider: TranslationProvider): string => {
  void provider;
  return 'DeepL';
};

const getRequestErrorMessage = ({
  provider,
  status,
  details,
}: CreateTranslationRequestErrorParams): string => {
  const providerLabel = getProviderLabel(provider);

  if (status === 400) {
    return `${providerLabel} request is invalid.`;
  }

  if (status === 401 || status === 403) {
    return `${providerLabel} API key is invalid or has no access.`;
  }

  if (status === 404) {
    return 'Translation proxy is not available.';
  }

  if (status === 429) {
    return `${providerLabel} request limit has been reached.`;
  }

  if (status >= 500) {
    return `${providerLabel} service is temporarily unavailable.`;
  }

  if (details) {
    return `${providerLabel} translation request failed. ${details}`;
  }

  return `${providerLabel} translation request failed with status ${status}.`;
};

export const createProviderNotImplementedError = ({
  provider,
  details,
}: CreateProviderNotImplementedErrorParams): Error => {
  const providerLabel = getProviderLabel(provider);

  const message = details
    ? `${providerLabel} provider is not implemented yet. ${details}`
    : `${providerLabel} provider is not implemented yet.`;

  return new Error(message);
};

export const createMissingApiKeyError = ({
  provider,
}: CreateMissingApiKeyErrorParams): Error => {
  const providerLabel = getProviderLabel(provider);

  return new Error(`Enter your ${providerLabel} API key.`);
};

export const createTranslationNetworkError = ({
  provider,
}: CreateTranslationNetworkErrorParams): Error => {
  const providerLabel = getProviderLabel(provider);

  return new Error(
    `${providerLabel} translation request could not be completed. Check your connection or local proxy.`,
  );
};

export const createTranslationRequestError = ({
  provider,
  status,
  details,
}: CreateTranslationRequestErrorParams): Error => {
  return new Error(
    getRequestErrorMessage({
      provider,
      status,
      details,
    }),
  );
};

export const createUnexpectedResponseError = ({
  provider,
}: CreateUnexpectedResponseErrorParams): Error => {
  const providerLabel = getProviderLabel(provider);

  return new Error(
    `${providerLabel} returned an unexpected response.`,
  );
};
