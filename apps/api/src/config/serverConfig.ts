export interface ServerConfig {
  port: number;
  host: string;
  corsOrigin: string;
}

/**
 * Gets server configuration from environment variables
 */
export function getServerConfig(): ServerConfig {
  return {
    port: parseInt(process.env.PORT_API || '2000', 10),
    host: process.env.HOST || '0.0.0.0',
    corsOrigin: process.env.CORS_ORIGIN || '*',
  };
}

