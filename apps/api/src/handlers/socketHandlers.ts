import { Server, Socket } from 'socket.io';
import { logger } from '@quick-sync/logger';
import { findSession } from '../services/sessionService';
import {
  addOrUpdateDevice,
  addMessage,
} from '../services/sessionService';
import { IDevice } from '../models/Session';

/**
 * Sets up Socket.IO event handlers
 */
export function setupSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    logger.info('Client connected', { socketId: socket.id });

    socket.on('joinSession', async (sessionId: string) => {
      try {
        socket.join(sessionId);
        logger.debug('Client joined session', { socketId: socket.id, sessionId });

        const session = await findSession(sessionId);
        if (session) {
          logger.info('Sending session data to client', {
            socketId: socket.id,
            sessionId,
            deviceCount: session.devices.length,
            messageCount: session.messages.length,
            devices: session.devices.map(d => ({ id: d.id, name: d.name })),
          });
          socket.emit('deviceUpdates', session.devices);
          socket.emit('messageUpdates', session.messages);
        } else {
          logger.warn('Session not found for join', { socketId: socket.id, sessionId });
          // Emit empty arrays so client knows session exists but has no data yet
          socket.emit('deviceUpdates', []);
          socket.emit('messageUpdates', []);
        }
      } catch (error) {
        logger.error('Error handling joinSession', { error, socketId: socket.id });
      }
    });

    socket.on('disconnect', () => {
      logger.info('Client disconnected', { socketId: socket.id });
    });
  });
}

/**
 * Emits device updates to all clients in a session
 */
export async function emitDeviceUpdates(
  io: Server,
  sessionId: string
): Promise<void> {
  const session = await findSession(sessionId);
  if (session) {
    const deviceCount = session.devices.length;
    logger.info('Emitting device updates to all clients in session', {
      sessionId,
      deviceCount,
      devices: session.devices.map(d => ({ id: d.id, name: d.name })),
    });
    io.to(sessionId).emit('deviceUpdates', session.devices);
  } else {
    logger.warn('Cannot emit device updates: session not found', { sessionId });
  }
}

/**
 * Emits message updates to all clients in a session
 */
export async function emitMessageUpdates(
  io: Server,
  sessionId: string
): Promise<void> {
  const session = await findSession(sessionId);
  if (session) {
    io.to(sessionId).emit('messageUpdates', session.messages);
    logger.debug('Message updates emitted', {
      sessionId,
      messageCount: session.messages.length,
    });
  }
}

