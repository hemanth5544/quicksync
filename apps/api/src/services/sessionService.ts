import { logger } from '@quick-sync/logger';
import SessionModel, { IDevice, IMessage } from '../models/Session';

/**
 * Creates or ensures a session exists
 */
export async function createOrEnsureSession(sessionId: string): Promise<void> {
  await SessionModel.findOneAndUpdate(
    { sessionId },
    { $setOnInsert: { sessionId } },
    { upsert: true, new: true }
  );
  logger.debug('Session created or ensured', { sessionId });
}

/**
 * Deletes a session
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  const result = await SessionModel.findOneAndDelete({ sessionId });
  if (result) {
    logger.info('Session deleted', { sessionId });
    return true;
  }
  logger.warn('Session not found for deletion', { sessionId });
  return false;
}

/**
 * Finds a session by ID
 */
export async function findSession(sessionId: string) {
  return await SessionModel.findOne({ sessionId });
}

/**
 * Adds or updates a device in a session
 */
export async function addOrUpdateDevice(
  sessionId: string,
  device: IDevice
): Promise<IDevice | null> {
  const session = await SessionModel.findOne({ sessionId });
  if (!session) {
    logger.warn('Session not found for device update', { sessionId, deviceId: device.id });
    return null;
  }

  // Remove existing device with same ID and add new one
  session.devices = session.devices.filter((d) => d.id !== device.id);
  session.devices.push(device);
  await session.save();

  logger.info('Device added/updated', { sessionId, deviceId: device.id });
  return device;
}

/**
 * Adds a message to a session
 */
export async function addMessage(
  sessionId: string,
  message: IMessage
): Promise<IMessage | null> {
  const session = await SessionModel.findOne({ sessionId });
  if (!session) {
    logger.warn('Session not found for message', { sessionId, messageId: message.id });
    return null;
  }

  session.messages.push(message);
  await session.save();

  logger.info('Message added', { sessionId, messageId: message.id, type: message.type });
  return message;
}

/**
 * Gets all devices for a session
 */
export async function getDevices(sessionId: string): Promise<IDevice[]> {
  const session = await SessionModel.findOne({ sessionId });
  return session?.devices ?? [];
}

/**
 * Gets all messages for a session
 */
export async function getMessages(sessionId: string): Promise<IMessage[]> {
  const session = await SessionModel.findOne({ sessionId });
  return session?.messages ?? [];
}

