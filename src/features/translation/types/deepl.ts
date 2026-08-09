export interface DeepLTranslateRequestBody {
  readonly text: string[];
  readonly target_lang: string;
  readonly show_billed_characters: boolean;
}

export interface DeepLTranslationResponseItem {
  readonly detected_source_language?: string;
  readonly text: string;
  readonly billed_characters?: number;
}

export interface DeepLTranslateResponse {
  readonly translations: DeepLTranslationResponseItem[];
}

export interface DeepLUsageRequestBody {
  readonly operation: 'usage';
}

export interface DeepLUsageResponse {
  readonly character_count: number;
  readonly character_limit: number;
  readonly api_key_character_count?: number;
  readonly api_key_character_limit?: number;
}

export type DeepLProxyTranslateRequestBody =
  DeepLTranslateRequestBody;

export type DeepLProxyTranslateResponse = DeepLTranslateResponse;

export interface DeepLProxyErrorResponse {
  readonly error: string;
  readonly status?: number;
  readonly details?: string;
}
