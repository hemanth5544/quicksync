import type { ExtensionConfig } from "@/types";

// Default configuration - can be overridden via storage
// Note: Socket.IO runs on the same port as the API server (2000)
// The ws://localhost:3000 is for raw WebSocket (WebRTC signaling), not Socket.IO
const DEFAULT_CONFIG: ExtensionConfig = {
  apiUrl: "http://localhost:2000",
  wsUrl: "http://localhost:2000",
  sessionStore: "Express",
  signaling: "WebSocket",
};

// Web app URL for session links
const DEFAULT_WEB_APP_URL = "http://localhost:5173";

export async function getConfig(): Promise<ExtensionConfig> {
  const result = await chrome.storage.sync.get("config");
  const config = result.config || DEFAULT_CONFIG;
  
  // Validate and log the config
  console.log("[Config] Loaded config:", {
    apiUrl: config.apiUrl,
    wsUrl: config.wsUrl,
    sessionStore: config.sessionStore,
    signaling: config.signaling,
  });
  
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

