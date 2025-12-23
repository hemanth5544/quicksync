
import WebSocket from 'ws';

export interface JoinMessage {
    action: 'join';
    sessionId: string;
    deviceId: string;
}

export interface SignalMessage {
    sessionId: string;
    sender: string;
    receiver: string;
    type: string; 
    signal: unknown;
}

export type IncomingMessage = JoinMessage | SignalMessage;

export interface ExtendedWebSocket extends WebSocket {
    sessionId?: string;
    deviceId?: string;
}
