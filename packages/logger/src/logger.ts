import winston from 'winston';

export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

export interface LoggerConfig {
  level?: LogLevel;
  format?: winston.Logform.Format;
  transports?: winston.transport[];
  defaultMeta?: Record<string, unknown>;
}

/**
 * Creates a Winston logger instance with sensible defaults
 */
export function createLogger(config: LoggerConfig = {}): winston.Logger {
  const {
    level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    format,
    transports,
    defaultMeta = {}
  } = config;

  // Default format: combine timestamp, errors, and JSON
  const defaultFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  );

  // Console format for development (more readable)
  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      return `${timestamp} [${level}]: ${message} ${metaString}`;
    })
  );

  // Default transports
  const defaultTransports: winston.transport[] = [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? defaultFormat : consoleFormat
    })
  ];

  return winston.createLogger({
    level,
    format: format || defaultFormat,
    defaultMeta,
    transports: transports || defaultTransports,
    // Don't exit on handled exceptions
    exitOnError: false
  });
}

/**
 * Default logger instance
 * Can be used directly or create custom instances with createLogger()
 */
export const logger = createLogger();

// Export winston types for advanced usage
export { winston };

