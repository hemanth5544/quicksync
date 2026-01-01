import { v4 as uuidv4 } from "uuid";

export function getDeviceId(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get("deviceId", (result) => {
      const deviceId = result.deviceId || uuidv4();
      chrome.storage.local.set({ deviceId }, () => {
        resolve(deviceId);
      });
    });
  });
}

export function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (ua.match(/iPhone/i)) return "iPhone";
  if (ua.match(/iPad/i)) return "iPad";
  if (ua.match(/Mac/i)) return "MacBook";
  if (ua.match(/Android/i)) return "Android Phone";
  if (ua.match(/Windows/i)) return "Windows PC";
  if (ua.match(/Linux/i)) return "Linux Device";
  return "Browser Extension";
}

