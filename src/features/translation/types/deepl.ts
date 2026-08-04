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