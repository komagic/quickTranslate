"use strict";
(() => {
  // src/background/background.ts
  var BackgroundScript = class {
    config;
    constructor() {
      this.config = {
        enabled: false,
        targetLanguage: "zh-CN",
        translationService: "google"
      };
    }
    async init() {
      const result = await chrome.storage.sync.get("translationConfig");
      if (result.translationConfig) {
        this.config = result.translationConfig;
      }
      this.setupContextMenu();
      this.setupKeyboardShortcuts();
      chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        this.handleMessage(message, sendResponse);
      });
    }
    setupContextMenu() {
      chrome.contextMenus.create({
        id: "translate-selection",
        title: "Translate Selection",
        contexts: ["selection"]
      });
      chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === "translate-selection" && tab?.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: "TRANSLATE_SELECTION",
            text: info.selectionText
          });
        }
      });
    }
    setupKeyboardShortcuts() {
      chrome.commands.onCommand.addListener(async (command) => {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true
        });
        if (!tab?.id)
          return;
        switch (command) {
          case "toggleTranslatePage":
            this.config.enabled = !this.config.enabled;
            await chrome.storage.sync.set({ translationConfig: this.config });
            chrome.tabs.sendMessage(tab.id, {
              type: "TOGGLE_TRANSLATION",
              enabled: this.config.enabled
            });
            break;
          case "toggleTranslateTheWholePage":
            chrome.tabs.sendMessage(tab.id, {
              type: "TRANSLATE_WHOLE_PAGE"
            });
            break;
        }
      });
    }
    handleMessage(message, sendResponse) {
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
      return true;
    }
  };
  var backgroundScript = new BackgroundScript();
  backgroundScript.init();
})();
