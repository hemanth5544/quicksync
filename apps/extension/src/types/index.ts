export interface Device {
  id: string;
  name: string;
  joinedAt: string;
  lastActiveAt: string;
}

export interface MessageStatus {
  type: "loading" | "loaded" | "error";
  progress?: number;
  error?: string;
}

export interface Message {
  id: string;
  sender: string;
  senderName: string;
  type: "text" | "file";
  sentAt: string;
  status: MessageStatus;
  text?: string;
  filename?: string;
  fileSize?: number;
  // Legacy field for compatibility
  content?: string;
  fileName?: string;
}

export interface Session {
  sessionId: string;
  devices: Device[];
  messages: Message[];
}

export interface ExtensionConfig {
  apiUrl: string;
  wsUrl: string;
  sessionStore: "Express" | "Firestore";
  signaling: "WebSocket" | "Firestore";
}

export interface StorageData {
  sessionId?: string;
  deviceId?: string;
  deviceName?: string;
  clipboardSyncEnabled?: boolean;
  lastClipboardContent?: string;
  theme?: "light" | "dark";
}

