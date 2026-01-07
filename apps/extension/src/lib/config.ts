import type { ExtensionConfig } from "@/types";

// Default configuration for browser extension
// These can be overridden by user settings in chrome.storage
const DEFAULT_CONFIG: ExtensionConfig = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:2000",
  wsUrl: import.meta.env.VITE_WS_URL || "http://localhost:3000",
  sessionStore: "Express",
  signaling: "WebSocket",
};

// Web app URL for session links
const DEFAULT_WEB_APP_URL = import.meta.env.VITE_HOST_URL || "http://localhost:5173";

export async function getConfig(): Promise<ExtensionConfig> {
  const result = await chrome.storage.sync.get("config");
  const config = result.config || DEFAULT_CONFIG;
  

  
  return config;
}

export async function setConfig(config: ExtensionConfig): Promise<void> {
  await chrome.storage.sync.set({ config });
}

export async function getWebAppUrl(): Promise<string> {
  const result = await chrome.storage.sync.get("webAppUrl");
  return result.webAppUrl || DEFAULT_WEB_APP_URL;
}

export async function setWebAppUrl(url: string): Promise<void> {
  await chrome.storage.sync.set({ webAppUrl: url });
}

