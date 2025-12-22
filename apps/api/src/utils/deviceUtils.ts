import { IDevice } from '../models/Session';

export interface ExpressDeviceBody {
  id: string;
  userAgent?: string;
  name?: string;
  joinedAt?: string;
  lastActiveAt?: string;
}

/**
 * Converts an Express request body to an IDevice model
 */
export function makeExpressDevice(body: ExpressDeviceBody): IDevice {
  const now = new Date();
  return {
    id: body.id,
    userAgent: body.userAgent ?? 'unknown',
    name: body.name,
    joinedAt: body.joinedAt ? new Date(body.joinedAt) : now,
    lastActiveAt: body.lastActiveAt ? new Date(body.lastActiveAt) : now,
  };
}

