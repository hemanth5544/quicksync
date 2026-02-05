import { sessionAPI } from "@/lib/api";
import { socketManager } from "@/lib/socket";
import { getStorageData, setStorageData } from "@/lib/storage";
import { getDeviceId, getDeviceName } from "@/lib/deviceUtils";
import type { Message } from "@/types";

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "share-text",
    title: "Share with Quick Sync",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "share-link",
    title: "Share link with Quick Sync",
    contexts: ["link"],
  });

  chrome.contextMenus.create({
    id: "share-image",
    title: "Share image with Quick Sync",
    contexts: ["image"],
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info) => {
  try {
    await sessionAPI.initialize();
    const storage = await getStorageData();

    if (!storage.sessionId) {
      console.error("No active session");
      return;
    }

    const deviceId = storage.deviceId || await getDeviceId();
    const deviceName = storage.deviceName || getDeviceName();

    let messageContent = "";
    let messageType: "text" | "file" = "text";

    if (info.menuItemId === "share-text" && info.selectionText) {
      messageContent = info.selectionText;
    } else if (info.menuItemId === "share-link" && info.linkUrl) {
      messageContent = info.linkUrl;
    } else if (info.menuItemId === "share-image" && info.srcUrl) {
      messageContent = info.srcUrl;
    }

    if (!messageContent) {
      return;
    }

    const message: Message = {
      id: crypto.randomUUID(),
      sender: deviceId,
      senderName: deviceName,
      type: messageType,
      text: messageContent,
      sentAt: new Date().toISOString(),
      status: {
        type: "loaded",
      },
    };

    await sessionAPI.sendMessage(storage.sessionId, message);

    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("assets/icon128.png"),
      title: "Quick Sync",
      message: "Message shared successfully",
    });
  } catch (error) {
    console.error("Context menu error:", error);
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("assets/icon128.png"),
      title: "Quick Sync Error",
      message: error instanceof Error ? error.message : "Failed to share",
    });
  }
});

// Clipboard sync
let lastClipboardContent = "";
let clipboardSyncEnabled = false;
let clipboardInterval: number | null = null;

async function initClipboardSync() {
  const storage = await getStorageData();
  clipboardSyncEnabled = storage.clipboardSyncEnabled ?? false;
  lastClipboardContent = storage.lastClipboardContent || "";

  if (clipboardSyncEnabled) {
    startClipboardMonitoring();
  }
}

function startClipboardMonitoring() {
  if (clipboardInterval) {
    clearInterval(clipboardInterval);
  }

  clipboardInterval = setInterval(async () => {
    if (!clipboardSyncEnabled) return;

    try {
      const clipboardText = await navigator.clipboard.readText();
      
      if (
        clipboardText &&
        clipboardText !== lastClipboardContent &&
        clipboardText.length > 0
      ) {
        lastClipboardContent = clipboardText;
        await setStorageData({ lastClipboardContent: clipboardText });

        const storage = await getStorageData();
        if (storage.sessionId && storage.deviceId) {
          const deviceName = storage.deviceName || getDeviceName();
          const message: Message = {
            id: crypto.randomUUID(),
            sender: storage.deviceId,
            senderName: deviceName,
            type: "text",
            text: clipboardText,
            sentAt: new Date().toISOString(),
            status: {
              type: "loaded",
            },
          };

          await sessionAPI.sendMessage(storage.sessionId, message);
        }
      }
    } catch (error) {
      // Clipboard access may fail - expected in some contexts
      console.debug("Clipboard read error:", error);
    }
  }, 2000) as unknown as number;
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.clipboardSyncEnabled) {
    clipboardSyncEnabled = changes.clipboardSyncEnabled.newValue ?? false;
    if (clipboardSyncEnabled) {
      startClipboardMonitoring();
    } else if (clipboardInterval) {
      clearInterval(clipboardInterval);
      clipboardInterval = null;
    }
  }
  
  // Reconnect socket when session changes
  if (changes.sessionId) {
    const newSessionId = changes.sessionId.newValue;
    if (newSessionId) {
      initializeBackgroundSocket(newSessionId);
    } else {
      socketManager.disconnect();
    }
  }
});

// Keep socket connection alive in background
async function initializeBackgroundSocket(sessionId?: string) {
  try {
    await sessionAPI.initialize();
    
    if (!sessionId) {
      const storage = await getStorageData();
      sessionId = storage.sessionId;
    }
    
    if (sessionId) {
      // Connect socket in background to keep it alive
      await socketManager.connect(sessionId);
      console.log("[Background] Socket connected for session:", sessionId);
      
      // Listen for message updates and send notifications
      socketManager.onMessageUpdates(async (messages) => {
        const storage = await getStorageData();
        if (messages.length > 0 && storage.deviceId) {
          const latestMessage = messages[messages.length - 1];
          if (latestMessage.sender !== storage.deviceId) {
            // Notify user of new message
            chrome.notifications.create({
              type: "basic",
              iconUrl: chrome.runtime.getURL("assets/icon128.png"),
              title: "Quick Sync - New Message",
              message: latestMessage.text || latestMessage.content || "New message received",
            });
          }
        }
      });
    }
  } catch (error) {
    console.error("[Background] Socket initialization error:", error);
  }
}

// Initialize on startup
initClipboardSync();
initializeBackgroundSocket();
