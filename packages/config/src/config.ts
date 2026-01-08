import * as dotenv from 'dotenv';

dotenv.config();


export type Environment = 'development' | 'production' | 'test';


export interface APIConfig {
  port: number;
  host: string;
  corsOrigin: string;
  mongoUri: string;
}


export interface WebSocketConfig {
  port: number;
  host: string;
}

export interface WebAppConfig {
  apiUrl: string;
  wsUrl: string;
  hostUrl: string;
  sessionStore: 'Express' | 'Firestore';
  signaling: 'WebSocket' | 'Firestore';
}


export interface ExtensionConfig {
  apiUrl: string;
  wsUrl: string;
  hostUrl: string;
  sessionStore: 'Express' | 'Firestore';
  signaling: 'WebSocket' | 'Firestore';
}

export interface AppConfig {
  environment: Environment;
  api: APIConfig;
  webSocket: WebSocketConfig;
  webApp: WebAppConfig;
  extension: ExtensionConfig;
}


export function getEnvironment(): Environment {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production' || env === 'test') {
    return env;
  }
  return 'development';
}


export function getAPIConfig(): APIConfig {
  return {
    port: parseInt(process.env.PORT_API || process.env.PORT || '2000', 10),
    host: process.env.HOST || '0.0.0.0',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/quick-sync',
  };
}


export function getWebSocketConfig(): WebSocketConfig {
  return {
    port: parseInt(process.env.PORT_WS || process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
  };
}


export function getWebAppConfig(): WebAppConfig {
  const apiUrl = process.env.VITE_API_URL || process.env.API_URL || 'http://localhost:2000';
  const wsUrl = process.env.VITE_WS_URL || process.env.WS_URL || 'http://localhost:3000';
  const hostUrl = process.env.VITE_HOST_URL || process.env.HOST_URL || 'http://localhost:5173';

  return {
    apiUrl,
    wsUrl,
    hostUrl,
    sessionStore: (process.env.VITE_SESSION_STORE || process.env.SESSION_STORE || 'Express') as 'Express' | 'Firestore',
    signaling: (process.env.VITE_SIGNALING || process.env.SIGNALING || 'WebSocket') as 'WebSocket' | 'Firestore',
  };
}


export function getExtensionConfig(): ExtensionConfig {
  const apiUrl = process.env.VITE_API_URL || process.env.API_URL || 'http://localhost:2000';
  const wsUrl = process.env.VITE_WS_URL || process.env.WS_URL || 'http://localhost:3000';
  const hostUrl = process.env.VITE_HOST_URL || process.env.HOST_URL || 'http://localhost:5173';

  return {
    apiUrl,
    wsUrl,
    hostUrl,
    sessionStore: (process.env.VITE_SESSION_STORE || process.env.SESSION_STORE || 'Express') as 'Express' | 'Firestore',
    signaling: (process.env.VITE_SIGNALING || process.env.SIGNALING || 'WebSocket') as 'WebSocket' | 'Firestore',
  };
}


export function getConfig(): AppConfig {
  return {
    environment: getEnvironment(),
    api: getAPIConfig(),
    webSocket: getWebSocketConfig(),
    webApp: getWebAppConfig(),
    extension: getExtensionConfig(),
  };
}


export function validateConfig(required: string[]): void {
  const missing: string[] = [];
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}


export function isProduction(): boolean {
  return getEnvironment() === 'production';
}


export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}


export function isTest(): boolean {
  return getEnvironment() === 'test';
}
