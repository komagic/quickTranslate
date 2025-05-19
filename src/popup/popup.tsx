import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Switch,
  FormControl,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
} from "@mui/material";
import { TranslationConfig, TranslationService } from "../types";

const Popup: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("zh-CN");
  const [translationService, setTranslationService] = useState<
    TranslationService
  >("google");

  useEffect(() => {
    const loadConfig = async () => {
      const result = await chrome.storage.sync.get("translationConfig");
      if (result.translationConfig) {
        const config = result.translationConfig as TranslationConfig;
        setEnabled(config.enabled);
        setTargetLanguage(config.targetLanguage);
        setTranslationService(config.translationService);
      }
    };
    loadConfig();
  }, []);

  const updateConfig = async () => {
    const config: TranslationConfig = {
      enabled,
      targetLanguage,
      translationService,
    };
    await chrome.storage.sync.set({ translationConfig: config });
    chrome.runtime.sendMessage({ type: "UPDATE_CONFIG", config });
  };

  const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnabled(event.target.checked);
    await updateConfig();
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: "TOGGLE_TRANSLATION",
        enabled: event.target.checked,
      });
    }
  };

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setTargetLanguage(event.target.value);
    updateConfig();
  };

  const handleServiceChange = (event: SelectChangeEvent) => {
    setTranslationService(event.target.value as TranslationService);
    updateConfig();
  };

  const handleTranslateWholePage = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: "TRANSLATE_WHOLE_PAGE" });
    }
  };

  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <Box sx={{ width: 300, p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Quick Translate</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Switch checked={enabled} onChange={handleToggle} />
          <Typography>{enabled ? "Enabled" : "Disabled"}</Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Target Language:
          </Typography>
          <Select
            value={targetLanguage}
            onChange={handleLanguageChange}
            size="small"
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
            Translation Service:
          </Typography>
          <Select
            value={translationService}
            onChange={handleServiceChange}
            size="small"
          >
            <MenuItem value="google">Google Translate</MenuItem>
            <MenuItem value="deepl">DeepL</MenuItem>
            <MenuItem value="openai">OpenAI</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          fullWidth
          disabled={!enabled}
          onClick={handleTranslateWholePage}
        >
          Translate Whole Page
        </Button>
        <Button variant="outlined" fullWidth onClick={handleOpenOptions}>
          Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Popup;
