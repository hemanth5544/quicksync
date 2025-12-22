import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { logger, createLogger } from '@quick-sync/logger';

import './db';
import { getServerConfig } from './config/serverConfig';
import sessionRouter, { setSocketIO } from './routes/sessionRoutes';
import { setupSocketHandlers } from './handlers/socketHandlers';

// Create a logger instance for the API service
const apiLogger = createLogger({
  level: (process.env.LOG_LEVEL as any) || 'info',
  defaultMeta: {
    service: 'session-api',
  },
});

// Get server configuration
const config = getServerConfig();

// Initialize Express app
const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: { origin: config.corsOrigin, methods: ['GET', 'POST'] },
});

// Setup routes (pass io instance to routes)
setSocketIO(io);
app.use(sessionRouter);

// Setup Socket.IO handlers (io is initialized above)
setupSocketHandlers(io);

// Start server
server.listen(config.port, config.host, () => {
  apiLogger.info('Session API server started', {
    host: config.host,
    port: config.port,
    corsOrigin: config.corsOrigin,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  apiLogger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    apiLogger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  apiLogger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    apiLogger.info('Server closed');
    process.exit(0);
  });
});
