# Logger Usage Examples

## Using the logger in your apps

### Example: Using in API app

Add to `apps/api/package.json`:
```json
{
  "dependencies": {
    "@quick-sync/logger": "*"
  }
}
```

Then in your code:
```typescript
import { logger } from '@quick-sync/logger';

// Basic logging
logger.info('Server starting...');
logger.error('Database connection failed', { error });
logger.warn('Rate limit approaching', { requests: 100 });

// With metadata
logger.info('User logged in', { userId: '123', ip: '192.168.1.1' });
```

### Example: Custom logger for specific service

```typescript
import { createLogger } from '@quick-sync/logger';

const apiLogger = createLogger({
  level: 'debug',
  defaultMeta: {
    service: 'session-api',
    version: '1.0.0'
  }
});

apiLogger.info('API server started', { port: 2000 });
apiLogger.error('Request failed', { 
  method: 'POST', 
  path: '/session',
  error: err.message 
});
```

### Example: Using in WebSocket server

```typescript
import { logger } from '@quick-sync/logger';

logger.info('WebSocket server starting', { port: 3000 });

io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
});
```

### Environment Variables

Set log level via environment:
```bash
LOG_LEVEL=debug npm run dev
LOG_LEVEL=error npm start
```

### Log Levels

- `error` - Only errors
- `warn` - Warnings and errors
- `info` - Info, warnings, and errors (default in production)
- `http` - HTTP requests + above
- `verbose` - Verbose + above
- `debug` - Debug + above (default in development)
- `silly` - All logs

