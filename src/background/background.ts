import { TranslationConfig } from "../types";

class BackgroundScript {
  private config: TranslationConfig;

  constructor() {
    this.config = {
      enabled: false,
      targetLanguage: "zh-CN",
      translationService: "google",
    };
  }

  async init() {
    // Load configuration from storage
    const result = await chrome.storage.sync.get("translationConfig");
    if (result.translationConfig) {
      this.config = result.translationConfig;
    }

    // Set up context menu
    this.setupContextMenu();

    // Listen for keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
    });
  }

  private setupContextMenu() {
    chrome.contextMenus.create({
      id: "translate-selection",
      title: "Translate Selection",
      contexts: ["selection"],
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === "translate-selection" && tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: "TRANSLATE_SELECTION",
          text: info.selectionText,
        });
      }
    });
  }

  private setupKeyboardShortcuts() {
    chrome.commands.onCommand.addListener(async (command) => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) return;

      switch (command) {
        case "toggleTranslatePage":
          this.config.enabled = !this.config.enabled;
          await chrome.storage.sync.set({ translationConfig: this.config });
          chrome.tabs.sendMessage(tab.id, {
            type: "TOGGLE_TRANSLATION",
            enabled: this.config.enabled,
          });
          break;
        case "toggleTranslateTheWholePage":
          chrome.tabs.sendMessage(tab.id, {
            type: "TRANSLATE_WHOLE_PAGE",
          });
          break;
      }
    });
  }

  private handleMessage(message: any, sendResponse: (response?: any) => void) {
    switch (message.type) {
      case "GET_CONFIG":
        sendResponse(this.config);
        break;
      case "UPDATE_CONFIG":
        this.config = { ...this.config, ...message.config };
        chrome.storage.sync.set({ translationConfig: this.config });
        sendResponse({ success: true });
        break;
    }
    return true; // Keep the message channel open for async response
  }
}

// Initialize background script
const backgroundScript = new BackgroundScript();
backgroundScript.init();
