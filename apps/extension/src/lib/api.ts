import type { Device, Message, ExtensionConfig } from "@/types";
import { getConfig } from "./config";

export class SessionAPI {
  private config: ExtensionConfig | null = null;

  async initialize(): Promise<void> {
    this.config = await getConfig();
  }

  private async getApiUrl(): Promise<string> {
    if (!this.config) {
      await this.initialize();
    }
    return this.config!.apiUrl;
  }

  async createSession(sessionId: string): Promise<void> {
    const apiUrl = await this.getApiUrl();
    const response = await fetch(`${apiUrl}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }
  }

  async addDevice(
    sessionId: string,
    deviceId: string,
    deviceName: string
  ): Promise<Device> {
    const apiUrl = await this.getApiUrl();
    const response = await fetch(
      `${apiUrl}/session/${sessionId}/device`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: deviceId,
          name: deviceName,
          joinedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to add device: ${response.statusText}`);
    }

    const data = await response.json();
    return data.device;
  }

  async getDevices(sessionId: string): Promise<Device[]> {
    const apiUrl = await this.getApiUrl();
    const response = await fetch(
      `${apiUrl}/session/${sessionId}/devices`
    );

    if (!response.ok) {
      throw new Error(`Failed to get devices: ${response.statusText}`);
    }

    const data = await response.json();
    return data.devices || [];
  }

  async sendMessage(sessionId: string, message: Message): Promise<void> {
    const apiUrl = await this.getApiUrl();
    const response = await fetch(
      `${apiUrl}/session/${sessionId}/message`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    const apiUrl = await this.getApiUrl();
    const response = await fetch(
      `${apiUrl}/session/${sessionId}/messages`
    );

    if (!response.ok) {
      throw new Error(`Failed to get messages: ${response.statusText}`);
    }

    const data = await response.json();
    return data.messages || [];
  }

  async deleteSession(sessionId: string): Promise<void> {
    const apiUrl = await this.getApiUrl();
    const response = await fetch(
      `${apiUrl}/session/${sessionId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete session: ${response.statusText}`);
    }
  }
}

export const sessionAPI = new SessionAPI();

