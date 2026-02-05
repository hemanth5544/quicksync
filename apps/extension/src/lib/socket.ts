import { io, Socket } from "socket.io-client";
import type { Device, Message, ExtensionConfig } from "@/types";
import { getConfig } from "./config";

class SocketManager {
  private socket: Socket | null = null;
  private config: ExtensionConfig | null = null;
  private sessionId: string | null = null;

  async connect(sessionId: string): Promise<void> {
    if (this.socket?.connected && this.sessionId === sessionId) {
      return; // Already connected to this session
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.config = await getConfig();
    this.sessionId = sessionId;

    // Socket.IO uses HTTP/HTTPS URLs, not ws:// URLs
    // The Socket.IO server runs on the same port as the API server (2000)
    let socketUrl = this.config.wsUrl;
    
    // Convert ws:// to http:// if needed (legacy config support)
    if (socketUrl.startsWith("ws://")) {
      socketUrl = socketUrl.replace("ws://", "http://");
    } else if (socketUrl.startsWith("wss://")) {
      socketUrl = socketUrl.replace("wss://", "https://");
    }

    // Ensure we have a valid HTTP/HTTPS URL
    if (!socketUrl || 
        socketUrl.includes("chrome-extension://") || 
        socketUrl.includes("moz-extension://") ||
        (!socketUrl.startsWith("http://") && !socketUrl.startsWith("https://"))) {
      console.error("[Socket] Invalid Socket.IO URL:", socketUrl);
      throw new Error("Invalid Socket.IO URL configuration. Must be http:// or https://");
    }

    // Validate URL format
    try {
      new URL(socketUrl);
    } catch (e) {
      console.error("[Socket] Invalid URL format:", socketUrl);
      throw new Error("Invalid Socket.IO URL format");
    }

    console.log("[Socket] Connecting to Socket.IO server at:", socketUrl, "for session:", sessionId);

    // Socket.IO connection options
    this.socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      forceNew: true, // Force a new connection
      timeout: 10000, // 10 second timeout
      // Socket.IO default path is /socket.io/
      path: "/socket.io/",
    });

    this.socket.on("connect", () => {
      console.log("[Socket] Connected to", socketUrl);
      this.socket?.emit("joinSession", sessionId);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error.message);
      console.error("[Socket] Attempted URL:", socketUrl);
    });

    this.socket.on("error", (error) => {
      console.error("[Socket] Error:", error);
    });
  }

  onDeviceUpdates(callback: (devices: Device[]) => void): () => void {
    if (!this.socket) {
      return () => {};
    }

    this.socket.on("deviceUpdates", callback);
    return () => {
      this.socket?.off("deviceUpdates", callback);
    };
  }

  onMessageUpdates(callback: (messages: Message[]) => void): () => void {
    if (!this.socket) {
      return () => {};
    }

    this.socket.on("messageUpdates", callback);
    return () => {
      this.socket?.off("messageUpdates", callback);
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.sessionId = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketManager = new SocketManager();

