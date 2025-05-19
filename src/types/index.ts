export interface TranslationConfig {
  enabled: boolean;
  targetLanguage: string;
  sourceLanguage?: string;
  translationService: TranslationService;
}

export type TranslationService =
  | "google"
  | "deepl"
  | "openai"
  | "bing"
  | "claude"
  | "gemini"
  | "custom1"
  | "custom2"
  | "custom3";

export interface TranslationResult {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  service: TranslationService;
}

export interface PageTranslationState {
  isEnabled: boolean;
  isTranslating: boolean;
  translatedElements: Set<HTMLElement>;
  originalTexts: Map<HTMLElement, string>;
}

export interface VideoSubtitleConfig {
  enabled: boolean;
  autoTranslate: boolean;
  targetLanguage: string;
}

export interface PDFConfig {
  enabled: boolean;
  targetLanguage: string;
}

export interface ImageConfig {
  enabled: boolean;
  targetLanguage: string;
}
