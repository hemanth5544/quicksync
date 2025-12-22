import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { logger, createLogger } from '@quick-sync/logger';

import './db';
import { getServerConfig } from './config/serverConfig';
import sessionRouter, { setSocketIO } from './routes/sessionRoutes';
import { setupSocketHandlers } from './handlers/socketHandlers';

const apiLogger = createLogger({
  level: (process.env.LOG_LEVEL as any) || 'info',
  defaultMeta: {
    service: 'session-api',
  },
});

const config = getServerConfig();

const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: config.corsOrigin, methods: ['GET', 'POST'] },
});

setSocketIO(io);
app.use(sessionRouter);

setupSocketHandlers(io);

server.listen(config.port, config.host, () => {
  apiLogger.info('Session API server started', {
    host: config.host,
    port: config.port,
    corsOrigin: config.corsOrigin,
  });
});

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
