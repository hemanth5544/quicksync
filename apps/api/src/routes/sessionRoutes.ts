import { Router, Request, Response } from 'express';
import { Server } from 'socket.io';
import { logger } from '@quick-sync/logger';
import {
  createOrEnsureSession,
  deleteSession,
  addOrUpdateDevice,
  addMessage,
  getDevices,
  getMessages,
} from '../services/sessionService';
import { makeExpressDevice } from '../utils/deviceUtils';
import { emitDeviceUpdates, emitMessageUpdates } from '../handlers/socketHandlers';
import { IMessage } from '../models/Session';

// Store io instance - will be set by index.ts
let ioInstance: Server | null = null;

export function setSocketIO(io: Server): void {
  ioInstance = io;
}

const router = Router();

/**
 * POST /session
 * Create or ensure a session exists
 */
router.post('/session', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.body as { sessionId?: string };
    
    if (!sessionId) {
      logger.warn('Session creation failed: sessionId required');
      res.status(400).json({ error: 'sessionId required' });
      return;
    }

    await createOrEnsureSession(sessionId);
    res.status(201).json({ message: 'Session ready' });
  } catch (error) {
    logger.error('Error creating session', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /session/:sessionId
 * Delete a session
 */
router.delete('/session/:sessionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const deleted = await deleteSession(sessionId);
    
    if (deleted) {
      res.json({ message: 'Session deleted' });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    logger.error('Error deleting session', { error, sessionId: req.params.sessionId });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /session/:sessionId/device
 * Add or update a device in a session
 */
router.post('/session/:sessionId/device', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const device = makeExpressDevice(req.body);
    const updatedDevice = await addOrUpdateDevice(sessionId, device);
    
    if (!updatedDevice) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Emit device updates to all clients in the session
    if (ioInstance) {
      logger.info('Emitting device updates after device addition', { sessionId, deviceId: updatedDevice.id });
      await emitDeviceUpdates(ioInstance, sessionId);
    } else {
      logger.warn('Socket.IO instance not available, cannot emit device updates', { sessionId });
    }

    res.json({ message: 'Device added', device: updatedDevice });
  } catch (error) {
    logger.error('Error adding device', { error, sessionId: req.params.sessionId });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /session/:sessionId/message
 * Add a message to a session
 */
router.post('/session/:sessionId/message', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const message: IMessage = req.body;
    const addedMessage = await addMessage(sessionId, message);
    
    if (!addedMessage) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Emit message updates to all clients in the session
    if (ioInstance) {
      await emitMessageUpdates(ioInstance, sessionId);
    }

    res.json({ message: 'Message added', messageObj: addedMessage });
  } catch (error) {
    logger.error('Error adding message', { error, sessionId: req.params.sessionId });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /session/:sessionId/devices
 * Get all devices for a session
 */
router.get('/session/:sessionId/devices', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const devices = await getDevices(sessionId);
    res.json({ devices });
  } catch (error) {
    logger.error('Error fetching devices', { error, sessionId: req.params.sessionId });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /session/:sessionId/messages
 * Get all messages for a session
 */
router.get('/session/:sessionId/messages', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const messages = await getMessages(sessionId);
    res.json({ messages });
  } catch (error) {
    logger.error('Error fetching messages', { error, sessionId: req.params.sessionId });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

