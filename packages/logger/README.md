# @quick-sync/logger

Shared logging utility using Winston for the Quick Sync monorepo.

## Installation

This package is part of the monorepo and is automatically available to all apps and packages.

## Usage

### Basic Usage

```typescript
import { logger } from '@quick-sync/logger';

logger.info('Application started');
logger.warn('This is a warning');
logger.error('An error occurred', { error: err });
logger.debug('Debug information', { data: someData });
```

### Custom Logger

Create a logger with custom configuration:

```typescript
import { createLogger } from '@quick-sync/logger';

const apiLogger = createLogger({
  level: 'debug',
  defaultMeta: {
    service: 'api',
    version: '1.0.0'
  }
});

apiLogger.info('API server started');
```

### Log Levels

Available log levels (from highest to lowest priority):
- `error` - Error events
- `warn` - Warning events
- `info` - Informational messages (default in production)
- `http` - HTTP requests
- `verbose` - Verbose information
- `debug` - Debug messages (default in development)
- `silly` - Silly messages

### Environment Variables

- `LOG_LEVEL` - Set the log level (e.g., `LOG_LEVEL=debug`)
- `NODE_ENV` - When set to `production`, uses JSON format; otherwise uses colored console format

### Advanced Usage

For advanced Winston features, you can import `winston` directly:

```typescript
import { winston, createLogger } from '@quick-sync/logger';

const logger = createLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Development

```bash
# Build the package
npm run build

# Type check
npm run check-types

# Watch mode
npm run dev
```

