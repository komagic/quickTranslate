import { TranslationResult, TranslationService } from "../types";
import axios from "axios";

export interface TranslationProvider {
  translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult>;
}

export class GoogleTranslationProvider implements TranslationProvider {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || "";
  }

  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`,
        {
          q: text,
          target: targetLanguage,
          source: sourceLanguage,
          format: "text",
        }
      );

      return {
        text: response.data.data.translations[0].translatedText,
        sourceLanguage:
          sourceLanguage ||
          response.data.data.translations[0].detectedSourceLanguage,
        targetLanguage,
        service: "google",
      };
    } catch (error) {
      console.error("Google translation failed:", error);
      throw error;
    }
  }
}

export class DeepLTranslationProvider implements TranslationProvider {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.DEEPL_API_KEY || "";
  }

  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    try {
      const response = await axios.post(
        "https://api-free.deepl.com/v2/translate",
        {
          text: [text],
          target_lang: targetLanguage,
          source_lang: sourceLanguage,
        },
        {
          headers: {
            Authorization: `DeepL-Auth-Key ${this.apiKey}`,
          },
        }
      );

      return {
        text: response.data.translations[0].text,
        sourceLanguage:
          sourceLanguage ||
          response.data.translations[0].detected_source_language,
        targetLanguage,
        service: "deepl",
      };
    } catch (error) {
      console.error("DeepL translation failed:", error);
      throw error;
    }
  }
}

export class OpenAITranslationProvider implements TranslationProvider {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
  }

  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a professional translator. Translate the following text from ${
                sourceLanguage || "auto-detected language"
              } to ${targetLanguage}. Only return the translated text without any explanations or additional content.`,
            },
            {
              role: "user",
              content: text,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        text: response.data.choices[0].message.content.trim(),
        sourceLanguage: sourceLanguage || "auto",
        targetLanguage,
        service: "openai",
      };
    } catch (error) {
      console.error("OpenAI translation failed:", error);
      throw error;
    }
  }
}

export class TranslationServiceFactory {
  static createProvider(service: TranslationService): TranslationProvider {
    switch (service) {
      case "google":
        return new GoogleTranslationProvider();
      case "deepl":
        return new DeepLTranslationProvider();
      case "openai":
        return new OpenAITranslationProvider();
      default:
        throw new Error(`Unsupported translation service: ${service}`);
    }
  }
}
