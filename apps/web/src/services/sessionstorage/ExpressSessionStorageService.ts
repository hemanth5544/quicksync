import axios from 'axios';
import io from 'socket.io-client';
import { ISessionStorageService } from "./ISessionStorageService.ts";
import {BaseMessage, FileMessage, Message, MessageStatus, MessageType, TextMessage} from "../../models/Message.ts";
import { Device } from "../../types.ts";
import {ExpressTimestamp} from "../../models/timestamp/ExpressTimestamp.ts";
import {ITimestamp} from "../../models/timestamp/ITimestamp.ts";
import {Config} from "../../config/config.ts";

export interface ExpressMessage {
    id: string;
    type: MessageType;
    sender: string;
    senderName: string;
    sentAt: string;
    status: MessageStatus;

    text?: string;

    filename?: string;
    fileSize?: number;
}

export function toExpress(message: Message): ExpressMessage {
    const base: ExpressMessage = {
        id: message.id,
        type: message.type,
        sender: message.sender,
        senderName: message.senderName,
        sentAt: message.sentAt.toISOString(),
        status: message.status,
    };

    return (message.type === MessageType.TEXT)
        ? Config.storeTextMessageContent ? { ...base, text: message.text } : { ...base }
        : { ...base, filename: message.filename, fileSize: message.fileSize }
}

export function fromExpress(expressMsg: ExpressMessage): Message {
    const base: BaseMessage = {
        id: expressMsg.id,
        type: expressMsg.type,
        sender: expressMsg.sender,
        senderName: expressMsg.senderName,
        sentAt: ExpressTimestamp.fromSerializable(expressMsg.sentAt),
        status: expressMsg.status,
    };

    return (expressMsg.type === MessageType.TEXT)
        ? Config.storeTextMessageContent ? { ...base, text: expressMsg.text } as TextMessage : base as TextMessage
        : { ...base, filename: expressMsg.filename, fileSize: expressMsg.fileSize } as FileMessage
}

export interface ExpressDevice {
    id: string;
    userAgent: string;
    name: string;
    joinedAt: string;
    lastActiveAt: string;
}

export function newExpressDevice(deviceId: string, deviceName: string): ExpressDevice {
    return {
        id: deviceId,
        userAgent: navigator.userAgent,
        lastActiveAt: ExpressTimestamp.now().toSerializable()!,
        joinedAt: ExpressTimestamp.now().toSerializable()!,
        name: deviceName,
    };
}

export function fromExpressDevice(expressDevice: ExpressDevice): Device {
    return {
        id: expressDevice.id,
        userAgent: expressDevice.userAgent,
        name: expressDevice.name,
        lastActiveAt: ExpressTimestamp.fromSerializable(expressDevice.lastActiveAt),
        joinedAt: ExpressTimestamp.fromSerializable(expressDevice.joinedAt),
    };
}

export class ExpressSessionStorageService implements ISessionStorageService {
    private socket;
    constructor(private serverUrl: string) {
        this.socket = io(this.serverUrl);
    }

    async createSessionIfNotExists(sessionId: string): Promise<void> {
        await axios.post(`${this.serverUrl}/session`, { sessionId });
    }

    async deleteSession(sessionId: string): Promise<void> {
        await axios.delete(`${this.serverUrl}/session/${sessionId}`);
    }

    async addDevice(sessionId: string, deviceId: string, deviceName: string): Promise<void> {
        await axios.post(`${this.serverUrl}/session/${sessionId}/device`, newExpressDevice(deviceId, deviceName));
    }

    async addMessage(sessionId: string, message: Message): Promise<void> {
        // Use the conversion function before sending.
        const expressMessage: ExpressMessage = toExpress(message);
        await axios.post(`${this.serverUrl}/session/${sessionId}/message`, expressMessage);
    }

    subscribeToDeviceUpdates(sessionId: string, callback: (devices: Device[]) => void): () => void {
        // Create a proper handler function that can be removed later
        const handler = (expressDevices: ExpressDevice[]) => {
            const devices = expressDevices.map((expressDevice: ExpressDevice) => fromExpressDevice(expressDevice));
            console.log(`[ExpressSessionStorage] Received device updates for session ${sessionId}:`, devices.length, 'devices');
            callback(devices);
        };
        
        // Join the session room when connected
        const joinSession = () => {
            console.log(`[ExpressSessionStorage] Joining session ${sessionId}`);
            this.socket.emit("joinSession", sessionId);
        };
        
        // If already connected, join immediately
        if (this.socket.connected) {
            joinSession();
        } else {
            // Wait for connection before joining
            this.socket.once("connect", joinSession);
        }
        
        // Set up listener for device updates
        this.socket.on("deviceUpdates", handler);
        
        // Return cleanup function
        return () => {
            this.socket.off("deviceUpdates", handler);
            this.socket.off("connect", joinSession);
        };
    }

    subscribeToMessageUpdates(sessionId: string, callback: (messages: Message[]) => void): () => void {
        // Create a proper handler function
        const handler = (expressMessages: ExpressMessage[]) => {
            const messages = expressMessages.map((msg: ExpressMessage) => {
                const converted = fromExpress(msg);
                // If the API sent text content, always include it in the message
                // (even if storeTextMessageContent is false, we should use it if available)
                if (msg.type === MessageType.TEXT && msg.text && !(converted as TextMessage).text) {
                    return { ...converted, text: msg.text } as TextMessage;
                }
                return converted;
            });
            callback(messages);
        };
        
        // Join the session room when connected
        const joinSession = () => {
            this.socket.emit("joinSession", sessionId);
        };
        
        if (this.socket.connected) {
            joinSession();
        } else {
            this.socket.once("connect", joinSession);
        }
        
        this.socket.on("messageUpdates", handler);
        
        return () => {
            this.socket.off("messageUpdates", handler);
            this.socket.off("connect", joinSession);
        };
    }

    createTimestamp(): ITimestamp {
        return ExpressTimestamp.now();
    }
}
