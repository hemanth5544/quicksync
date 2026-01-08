import WebSocket, {RawData, WebSocketServer} from 'ws';
import {ExtendedWebSocket, IncomingMessage, SignalMessage} from "./types";
import { logger } from '@quick-sync/logger';
import { getWebSocketConfig } from '@quick-sync/config';

const sessions = new Map<string, Map<string, ExtendedWebSocket>>();

const config = getWebSocketConfig();
const PORT = config.port;
const HOST = config.host;

logger.info('Starting WebSocket server', { host: HOST, port: PORT });

const wss = new WebSocketServer({ port: PORT, host: HOST });

wss.on('connection', (wsRaw) => {
    const ws = wsRaw as ExtendedWebSocket;
    logger.info('New client connected');
    //emiting messages to clinet connected in same session
    ws.on('message', (data: RawData) => {
        const text = data.toString();
        logger.info('received:', text);

        let msg: IncomingMessage;
        try {
            msg = JSON.parse(text) as IncomingMessage;
        } catch (err) {
            logger.error('Invalid JSON:', err);
            return;
        }

        if ('action' in msg && msg.action === 'join') {
            const { sessionId, deviceId } = msg;
            ws.sessionId = sessionId;
            ws.deviceId = deviceId;

            if (!sessions.has(sessionId)) {
                sessions.set(sessionId, new Map());
            }
            sessions.get(sessionId)!.set(deviceId, ws);
            return;
        }

        const { sessionId, receiver } = msg as SignalMessage;
        const sessionMap = sessions.get(sessionId);
        if (!sessionMap) {
            logger.warn(`No such session: ${sessionId}`);
            return;
        }

        const target = sessionMap.get(receiver);
        if (target && target.readyState === WebSocket.OPEN) {
            target.send(text);
        } else {
            logger.warn(`Target device ${receiver} not connected`);
        }
    });

    ws.on('close', () => {
        logger.info('Client disconnected');
        const { sessionId, deviceId } = ws;
        if (sessionId && deviceId) {
            const sessionMap = sessions.get(sessionId);
            sessionMap?.delete(deviceId);
            if (sessionMap && sessionMap.size === 0) {
                sessions.delete(sessionId);
            }
        }
    });
});

logger.info(`WebSocket server is running on ws://${HOST}:${PORT}`);
