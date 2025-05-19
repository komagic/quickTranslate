import {
  TranslationConfig,
  PageTranslationState,
} from "../types";
import { TranslationServiceFactory } from "../services/translation";

class ContentScript {
  private config: TranslationConfig;
  private state: PageTranslationState;
  private observer: MutationObserver;

  constructor() {
    this.config = {
      enabled: false,
      targetLanguage: "zh-CN",
      translationService: "google",
    };
    this.state = {
      isEnabled: false,
      isTranslating: false,
      translatedElements: new Set(),
      originalTexts: new Map(),
    };
    this.observer = new MutationObserver(this.handleMutations.bind(this));
  }

  async init() {
    // Load configuration from storage
    const result = await chrome.storage.sync.get("translationConfig");
    if (result.translationConfig) {
      this.config = result.translationConfig;
    }

    // Start observing DOM changes
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
    });
  }

  private async handleMutations(mutations: MutationRecord[]) {
    if (!this.config.enabled || this.state.isTranslating) return;

    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof HTMLElement) {
            await this.translateElement(node);
          }
        }
      }
    }
  }

  private async translateElement(element: HTMLElement) {
    if (this.state.translatedElements.has(element)) return;

    const text = element.textContent;
    if (!text) return;

    try {
      this.state.isTranslating = true;
      const provider = TranslationServiceFactory.createProvider(
        this.config.translationService
      );
      const result = await provider.translate(
        text,
        this.config.targetLanguage,
        this.config.sourceLanguage
      );

      this.state.originalTexts.set(element, text);
      element.textContent = result.text;
      this.state.translatedElements.add(element);
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      this.state.isTranslating = false;
    }
  }

  private handleMessage(message: any, sendResponse: (response?: any) => void) {
    switch (message.type) {
      case "TOGGLE_TRANSLATION":
        this.config.enabled = message.enabled;
        if (this.config.enabled) {
          this.translatePage();
        } else {
          this.restoreOriginalTexts();
        }
        break;
      case "UPDATE_CONFIG":
        this.config = { ...this.config, ...message.config };
        break;
    }
    sendResponse({ success: true });
  }

  private async translatePage() {
    const elements = document.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, span, div"
    );
    for (const element of Array.from(elements)) {
      if (element instanceof HTMLElement) {
        await this.translateElement(element);
      }
    }
  }

  private restoreOriginalTexts() {
    for (const [element, text] of this.state.originalTexts) {
      element.textContent = text;
    }
    this.state.translatedElements.clear();
    this.state.originalTexts.clear();
  }
}

// Initialize content script
const contentScript = new ContentScript();
contentScript.init();
