/**
 * @quick-sync/logger
 * 
 * Shared logging utility using Winston for Quick Sync monorepo
 * 
 * Usage:
 * ```ts
 * import { logger } from '@quick-sync/logger';
 * 
 * logger.info('Application started');
 * logger.error('Something went wrong', { error });
 * ```
 * 
 * Or create a custom logger:
 * ```ts
 * import { createLogger } from '@quick-sync/logger';
 * 
 * const customLogger = createLogger({
 *   level: 'debug',
 *   defaultMeta: { service: 'api' }
 * });
 * ```
 */

export { logger, createLogger, winston } from './logger';
export type { LogLevel, LoggerConfig } from './logger';

