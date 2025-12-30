import {ISignalingService} from "./ISignalingService.ts";
import {Signal} from "../../../types.ts";

interface WSMessage {
    sessionId: string;
    sender: string;
    receiver: string;
    type: string; // "offer", "answer", "candidate"
    signal: Signal;
}

/**
 * A WebSocket-based implementation of the signaling channel.
 */
export class WebSocketSignalingService implements ISignalingService {
    private ws: WebSocket | null = null;
    private callback?: (remoteDeviceId: string, signalData: Signal) => void;

    /**
     * @param sessionId - The current session identifier.
     * @param deviceId - This device’s identifier.
     * @param wsUrl - The WebSocket server URL.
     */
    constructor(
        private sessionId: string,
        private deviceId: string,
        wsUrl: string
    ) {
        if (!wsUrl) {
            console.error("WebSocket URL is not configured. Please check your config.json file.");
            return;
        }

        try {
            this.ws = new WebSocket(wsUrl);
        } catch (err) {
            console.error("Failed to create WebSocket connection:", err);
            console.error("WebSocket URL:", wsUrl);
            return;
        }

        this.ws.onopen = () => {
            console.log("WebSocket signaling channel connected to:", wsUrl);
            const joinMsg = {
                action: "join",
                sessionId: this.sessionId,
                deviceId: this.deviceId,
            };
            try {
                this.ws.send(JSON.stringify(joinMsg));
            } catch (err) {
                console.error("Failed to send join message:", err);
            }
        };

        this.ws.onmessage = async (event: MessageEvent) => {
            let messageText: string;
            if (event.data instanceof Blob) {
                try {
                    messageText = await event.data.text();
                } catch (err) {
                    console.error("Error reading Blob as text", err);
                    return;
                }
            } else if (typeof event.data === "string") {
                messageText = event.data;
            } else {
                console.warn("Received message that is neither string nor Blob:", event.data);
                return;
            }

            if (!messageText.trim()) {
                console.warn("Received empty message:", messageText);
                return;
            }

            try {
                const msg: WSMessage = JSON.parse(messageText);
                // Only process messages for this session and intended for this device.
                if (msg.sessionId === this.sessionId && msg.receiver === this.deviceId) {
                    if (this.callback) {
                        this.callback(msg.sender, msg.signal);
                    }
                } else {
                    // console.warn(`Ignoring message not intended for this device | this: ${deviceId}, to: ${msg.receiver}, from: ${msg.sender}`);
                }
            } catch (err) {
                console.error("Error processing WebSocket message", err);
            }
        };

        this.ws.onerror = (event: Event) => {
            const error = event as ErrorEvent;
            console.error("WebSocket error occurred:", {
                type: error.type,
                message: error.message,
                error: error.error,
                url: wsUrl,
                readyState: this.ws?.readyState,
                readyStateText: this.getReadyStateText(this.ws?.readyState),
            });
            
            // Provide helpful error message
            if (this.ws?.readyState === WebSocket.CLOSED || this.ws?.readyState === WebSocket.CLOSING) {
                console.warn("WebSocket connection failed. Make sure the WebSocket server is running on:", wsUrl);
                console.warn("If using ws-server, ensure it's started with: npm run dev (in apps/ws-server)");
            }
        };

        this.ws.onclose = (event: CloseEvent) => {
            console.log("WebSocket signaling channel closed:", {
                code: event.code,
                reason: event.reason || "No reason provided",
                wasClean: event.wasClean,
                url: wsUrl,
            });
            
            if (!event.wasClean && event.code !== 1000) {
                console.warn("WebSocket closed unexpectedly. Code:", event.code);
            }
        };
    }

    private getReadyStateText(state: number | undefined): string {
        if (state === undefined) return "UNKNOWN";
        switch (state) {
            case WebSocket.CONNECTING: return "CONNECTING";
            case WebSocket.OPEN: return "OPEN";
            case WebSocket.CLOSING: return "CLOSING";
            case WebSocket.CLOSED: return "CLOSED";
            default: return `UNKNOWN (${state})`;
        }
    }

    public sendSignal(remoteDeviceId: string, signalData: Signal): void {
        if (!this.ws) {
            console.error("WebSocket is not initialized. Cannot send signal.");
            return;
        }

        const msg: WSMessage = {
            sessionId: this.sessionId,
            sender: this.deviceId,
            receiver: remoteDeviceId,
            type: signalData.type,
            signal: signalData,
        };

        const sendMessage = () => {
            try {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify(msg));
                } else {
                    console.warn("Cannot send signal: WebSocket is not open. State:", this.getReadyStateText(this.ws?.readyState));
                }
            } catch (err) {
                console.error("Error sending WebSocket signal:", err);
            }
        };

        if (this.ws.readyState === WebSocket.OPEN) {
            sendMessage();
        } else if (this.ws.readyState === WebSocket.CONNECTING) {
            this.ws.addEventListener("open", sendMessage, { once: true });
        } else {
            console.warn("WebSocket is not in a state to send messages. State:", this.getReadyStateText(this.ws.readyState));
        }
    }

    public onSignal(callback: (remoteDeviceId: string, signalData: Signal) => void): void {
        this.callback = callback;
    }
}
