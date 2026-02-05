import { getAPIConfig, type APIConfig } from '@quick-sync/config';

export interface ServerConfig {
  port: number;
  host: string;
  corsOrigin: string;
}

/**
 * Gets server configuration from environment variables
 */
export function getServerConfig(): ServerConfig {
  const config = getAPIConfig();
  return {
    port: config.port,
    host: config.host,
    corsOrigin: config.corsOrigin,
  };
}

/**
 * Export the full API config for MongoDB connection
 */
export { getAPIConfig };

