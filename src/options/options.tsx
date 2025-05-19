import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Paper,
  SelectChangeEvent,
} from "@mui/material";
import { TranslationService } from "../types";

interface ApiKeys {
  google: string;
  deepl: string;
  openai: string;
}

interface DefaultSettings {
  targetLanguage: string;
  translationService: TranslationService;
}

interface AdvancedSettings {
  autoTranslate: boolean;
  translateImages: boolean;
  translateVideos: boolean;
}

export const Options: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    google: "",
    deepl: "",
    openai: "",
  });

  const [defaultSettings, setDefaultSettings] = useState<DefaultSettings>({
    targetLanguage: "zh-CN",
    translationService: "google",
  });

  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    autoTranslate: false,
    translateImages: false,
    translateVideos: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const result = await chrome.storage.sync.get([
        "apiKeys",
        "defaultSettings",
        "advancedSettings",
      ]);

      if (result.apiKeys) {
        setApiKeys(result.apiKeys);
      }
      if (result.defaultSettings) {
        setDefaultSettings(result.defaultSettings);
      }
      if (result.advancedSettings) {
        setAdvancedSettings(result.advancedSettings);
      }
    };
    loadSettings();
  }, []);

  const handleApiKeyChange = (key: keyof ApiKeys) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newApiKeys = { ...apiKeys, [key]: event.target.value };
    setApiKeys(newApiKeys);
    chrome.storage.sync.set({ apiKeys: newApiKeys });
  };

  const handleDefaultSettingChange = (key: keyof DefaultSettings) => (
    event: SelectChangeEvent
  ) => {
    const newSettings = {
      ...defaultSettings,
      [key]: event.target.value as any,
    };
    setDefaultSettings(newSettings);
    chrome.storage.sync.set({ defaultSettings: newSettings });
  };

  const handleAdvancedSettingChange = (key: keyof AdvancedSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSettings = { ...advancedSettings, [key]: event.target.checked };
    setAdvancedSettings(newSettings);
    chrome.storage.sync.set({ advancedSettings: newSettings });
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Quick Translate Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          API Keys
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Google Translate API Key"
            type="password"
            value={apiKeys.google}
            onChange={handleApiKeyChange("google")}
            fullWidth
          />
          <TextField
            label="DeepL API Key"
            type="password"
            value={apiKeys.deepl}
            onChange={handleApiKeyChange("deepl")}
            fullWidth
          />
          <TextField
            label="OpenAI API Key"
            type="password"
            value={apiKeys.openai}
            onChange={handleApiKeyChange("openai")}
            fullWidth
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Default Settings
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Default Target Language:
            </Typography>
            <Select
              value={defaultSettings.targetLanguage}
              onChange={handleDefaultSettingChange("targetLanguage")}
            >
              <MenuItem value="zh-CN">Chinese (Simplified)</MenuItem>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ja">Japanese</MenuItem>
              <MenuItem value="ko">Korean</MenuItem>
              <MenuItem value="fr">French</MenuItem>
              <MenuItem value="de">German</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Default Translation Service:
            </Typography>
            <Select
              value={defaultSettings.translationService}
              onChange={handleDefaultSettingChange("translationService")}
            >
              <MenuItem value="google">Google Translate</MenuItem>
              <MenuItem value="deepl">DeepL</MenuItem>
              <MenuItem value="openai">OpenAI</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Advanced Settings
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={advancedSettings.autoTranslate}
                onChange={handleAdvancedSettingChange("autoTranslate")}
              />
            }
            label="Auto-translate on page load"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={advancedSettings.translateImages}
                onChange={handleAdvancedSettingChange("translateImages")}
              />
            }
            label="Translate image alt text"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={advancedSettings.translateVideos}
                onChange={handleAdvancedSettingChange("translateVideos")}
              />
            }
            label="Translate video subtitles"
          />
        </Box>
      </Paper>
    </Box>
  );
};

const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(<Options />);
}
