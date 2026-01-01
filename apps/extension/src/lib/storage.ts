import type { StorageData } from "@/types";

export async function getStorageData(): Promise<StorageData> {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ["sessionId", "deviceId", "deviceName", "clipboardSyncEnabled", "lastClipboardContent", "theme"],
      (result) => {
        resolve({
          sessionId: result.sessionId,
          deviceId: result.deviceId,
          deviceName: result.deviceName,
          clipboardSyncEnabled: result.clipboardSyncEnabled ?? false,
          lastClipboardContent: result.lastClipboardContent,
          theme: result.theme,
        });
      }
    );
  });
}

export async function setStorageData(data: Partial<StorageData>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, () => {
      resolve();
    });
  });
}

export async function clearStorage(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.clear(() => {
      resolve();
    });
  });
}

