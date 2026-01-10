import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Send, Smartphone, Plus, ExternalLink, Copy, QrCode, Trash2, Share2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardToggle } from "@/components/ClipboardToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/components/ui/toast";
import { sessionAPI } from "@/lib/api";
import { socketManager } from "@/lib/socket";
import { getStorageData, setStorageData } from "@/lib/storage";
import { getDeviceId, getDeviceName } from "@/lib/deviceUtils";
import { getWebAppUrl } from "@/lib/config";
import type { Device, Message } from "@/types";
export default function Popup() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string>("Browser Extension");
  const [devices, setDevices] = useState<Device[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [webAppUrl, setWebAppUrlState] = useState<string>("");
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    getWebAppUrl().then(setWebAppUrlState);
  }, []);

  // Initialize session
  useEffect(() => {
    async function initialize() {
      try {
        await sessionAPI.initialize();
        const storage = await getStorageData();
        
        let currentSessionId = storage.sessionId;
        if (!currentSessionId) {
          currentSessionId = uuidv4();
          await setStorageData({ sessionId: currentSessionId });
        }
        setSessionId(currentSessionId);

        let currentDeviceId = storage.deviceId;
        if (!currentDeviceId) {
          currentDeviceId = await getDeviceId();
          await setStorageData({ deviceId: currentDeviceId });
        }
        setDeviceId(currentDeviceId);

        const currentDeviceName = storage.deviceName || getDeviceName();
        await setStorageData({ deviceName: currentDeviceName });
        setDeviceName(currentDeviceName);

        // Create session and add device
        await sessionAPI.createSession(currentSessionId);
        await sessionAPI.addDevice(currentSessionId, currentDeviceId, currentDeviceName);

        // Connect socket (with error handling)
        try {
          await socketManager.connect(currentSessionId);
        } catch (socketError) {
          console.warn("[Popup] Socket connection failed (non-critical):", socketError);
        }

        // Load initial data
        const [devicesData, messagesData] = await Promise.all([
          sessionAPI.getDevices(currentSessionId),
          sessionAPI.getMessages(currentSessionId),
        ]);
        setDevices(devicesData);
        setMessages(messagesData);
        setLastMessageCount(messagesData.length);

        // Subscribe to updates
        socketManager.onDeviceUpdates((updatedDevices) => {
          setDevices(updatedDevices);
        });

        socketManager.onMessageUpdates((updatedMessages) => {
          const previousCount = lastMessageCount;
          console.log('[Popup] Received message updates:', updatedMessages.length, 'messages');
          if (updatedMessages.length > 0) {
            const latest = updatedMessages[updatedMessages.length - 1];
            console.log('[Popup] Latest message:', {
              id: latest.id,
              type: latest.type,
              hasText: !!latest.text,
              text: latest.text,
              sender: latest.sender
            });
          }
          setMessages(updatedMessages);
          setLastMessageCount(updatedMessages.length);
          
          // Show notification for new messages (not from this device)
          if (updatedMessages.length > previousCount && currentDeviceId && updatedMessages.length > 0) {
            const latestMessage = updatedMessages[updatedMessages.length - 1];
            if (latestMessage.sender !== currentDeviceId) {
              chrome.notifications.create({
                type: "basic",
                iconUrl: chrome.runtime.getURL("assets/icon128.png"),
                title: "Quick Sync - New Message",
                message: latestMessage.text || latestMessage.content || "New message received",
              });
            }
          }
        });
      } catch (err) {
        console.error("Initialization error:", err);
        showToast("error", err instanceof Error ? err.message : "Failed to initialize");
      } finally {
        setIsLoading(false);
      }
    }

    initialize();

    return () => {
      socketManager.disconnect();
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages periodically when popup is open
  useEffect(() => {
    if (!sessionId) return;

    const pollInterval = setInterval(async () => {
      try {
        const updatedMessages = await sessionAPI.getMessages(sessionId);
        if (updatedMessages.length !== messages.length) {
          setMessages(updatedMessages);
          setLastMessageCount(updatedMessages.length);
        }
      } catch (err) {
        console.error("Message polling error:", err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [sessionId, messages.length]);

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !sessionId || !deviceId || isSending) return;

    setIsSending(true);
    try {
      const message: Message = {
        id: uuidv4(),
        sender: deviceId,
        senderName: deviceName,
        type: "text",
        text: messageInput.trim(),
        sentAt: new Date().toISOString(),
        status: {
          type: "loaded",
        },
      };

      await sessionAPI.sendMessage(sessionId, message);
      setMessageInput("");
      showToast("success", "Message sent");
    } catch (err) {
      console.error("Send message error:", err);
      showToast("error", err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  }, [messageInput, sessionId, deviceId, deviceName, isSending, showToast]);

  const handleNewSession = useCallback(async () => {
    const newSessionId = uuidv4();
    await setStorageData({ sessionId: newSessionId });
    setSessionId(newSessionId);
    setDevices([]);
    setMessages([]);
    setLastMessageCount(0);
    
    try {
      await sessionAPI.createSession(newSessionId);
      if (deviceId) {
        await sessionAPI.addDevice(newSessionId, deviceId, getDeviceName());
      }
      await socketManager.connect(newSessionId);
      showToast("success", "New session created");
    } catch (err) {
      console.error("New session error:", err);
      showToast("error", err instanceof Error ? err.message : "Failed to create session");
    }
  }, [deviceId, showToast]);

  const handleClearSession = useCallback(async () => {
    if (!sessionId) return;
    
    if (!confirm("Are you sure you want to clear this session? This will delete all messages and disconnect all devices.")) {
      return;
    }

    try {
      await sessionAPI.deleteSession(sessionId);
      socketManager.disconnect();
      
      // Create a new session
      const newSessionId = uuidv4();
      await setStorageData({ sessionId: newSessionId });
      setSessionId(newSessionId);
      setDevices([]);
      setMessages([]);
      setLastMessageCount(0);
      
      await sessionAPI.createSession(newSessionId);
      if (deviceId) {
        await sessionAPI.addDevice(newSessionId, deviceId, getDeviceName());
      }
      await socketManager.connect(newSessionId);
      showToast("success", "Session cleared");
    } catch (err) {
      console.error("Clear session error:", err);
      showToast("error", err instanceof Error ? err.message : "Failed to clear session");
    }
  }, [sessionId, deviceId, showToast]);

  const handleShareCurrentTab = useCallback(async () => {
    if (!sessionId || !deviceId) return;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url || !tab.title) {
        showToast("error", "Unable to get current tab information");
        return;
      }

      const tabMessage = `${tab.title}\n${tab.url}`;
      const message: Message = {
        id: uuidv4(),
        sender: deviceId,
        senderName: deviceName,
        type: "text",
        text: tabMessage,
        sentAt: new Date().toISOString(),
        status: {
          type: "loaded",
        },
      };

      await sessionAPI.sendMessage(sessionId, message);
      showToast("success", "Tab shared successfully");
    } catch (err) {
      console.error("Share tab error:", err);
      showToast("error", err instanceof Error ? err.message : "Failed to share tab");
    }
  }, [sessionId, deviceId, deviceName, showToast]);

  const handleCopyLink = useCallback(async () => {
    if (!sessionId) return;
    const link = getSessionLink();
    await navigator.clipboard.writeText(link);
    showToast("success", "Link copied to clipboard");
  }, [sessionId, showToast]);

  const getSessionLink = useCallback(() => {
    if (!sessionId) return "";
    return `${webAppUrl}/session/${sessionId}`;
  }, [sessionId, webAppUrl]);

  if (isLoading) {
    return (
      <div className="w-[380px] min-h-[500px] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="w-[380px] min-h-[500px] max-h-[600px] bg-background flex flex-col" 
        style={{ width: '380px', minWidth: '380px', maxWidth: '380px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Card className="border-0 border-b rounded-none shadow-none">
          <CardHeader className="pb-3 pt-4 px-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-semibold truncate">Quick Sync</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {devices.length} device{devices.length !== 1 ? "s" : ""} connected
                </CardDescription>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    chrome.tabs.create({ url: getSessionLink() });
                  }}
                  className="h-8 w-8"
                  title="Open Web App"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQrOpen(true);
                  }}
                  className="h-8 w-8"
                  title="Show QR Code"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNewSession();
                  }}
                  className="h-8 w-8"
                  title="New Session"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearSession();
                  }}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  title="Clear Session"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <CardContent className="p-4 space-y-4">
            {/* Devices List - Compact */}
            {devices.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Devices ({devices.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {devices.map((device) => {
                    const initial = device.name.charAt(0).toUpperCase();
                    return (
                      <div
                        key={device.id}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/50"
                        title={device.name}
                      >
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                          device.id === deviceId 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-secondary text-secondary-foreground"
                        }`}>
                          {initial}
                        </div>
                        <span className="text-xs font-medium truncate max-w-[100px]">
                          {device.id === deviceId ? "You" : device.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Messages - Compact */}
            {messages.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Messages ({messages.length})
                  </span>
                </div>
                <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === deviceId ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`inline-block max-w-[85%] text-xs px-2.5 py-1.5 rounded-lg ${
                          msg.sender === deviceId
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        }`}
                      >
                        <div className={`font-medium mb-0.5 text-[10px] ${
                          msg.sender === deviceId ? "opacity-80" : "text-muted-foreground"
                        }`}>
                          {msg.sender === deviceId ? "You" : "Other"}
                        </div>
                        <div className="break-words whitespace-pre-wrap">
                          {msg.type === "text" 
                            ? (msg.text || msg.content || "[Empty message]")
                            : (msg.filename || msg.fileName || "File")}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}

            {/* Empty State */}
            {devices.length === 0 && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground mb-1">No messages yet</p>
                <p className="text-xs text-muted-foreground">Share something to get started</p>
              </div>
            )}
          </CardContent>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t bg-background">
          <CardContent className="p-4 space-y-3">
            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => {
                  e.stopPropagation();
                  setMessageInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                disabled={isSending}
                className="flex-1 h-9 text-sm"
              />
              <ClipboardToggle />
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendMessage();
                }}
                disabled={!messageInput.trim() || isSending}
                size="icon"
                className="h-9 w-9"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Session</DialogTitle>
            <DialogDescription>
              Scan this QR code or share the link to connect another device
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {sessionId && (
              <>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    getSessionLink()
                  )}`}
                  alt="QR Code"
                  className="rounded-lg border"
                />
                <div className="text-xs text-muted-foreground font-mono break-all text-center px-4">
                  {getSessionLink()}
                </div>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyLink();
                  }} 
                  variant="outline" 
                  size="sm"
                >
                  <Copy className="h-3 w-3 mr-2" />
                  Copy Link
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
}
