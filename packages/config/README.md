# @quick-sync/config

Shared configuration package for Quick Sync applications.

## Features

- Centralized configuration management
- Environment variable loading with dotenv
- Type-safe configuration objects
- Support for multiple environments (development, production, test)
- Validation of required environment variables

## Usage

### In API Server

```typescript
import { getAPIConfig } from '@quick-sync/config';

const config = getAPIConfig();
console.log(`API Server starting on ${config.host}:${config.port}`);
```

### In WebSocket Server

```typescript
import { getWebSocketConfig } from '@quick-sync/config';

const config = getWebSocketConfig();
console.log(`WebSocket Server starting on ${config.host}:${config.port}`);
```

### In Web App

```typescript
import { getWebAppConfig } from '@quick-sync/config';

const config = getWebAppConfig();
console.log(`API URL: ${config.apiUrl}`);
```

### In Extension

```typescript
import { getExtensionConfig } from '@quick-sync/config';

const config = getExtensionConfig();
console.log(`Extension connecting to: ${config.apiUrl}`);
```

### Validation

```typescript
import { validateConfig } from '@quick-sync/config';

// Ensure required environment variables are set
validateConfig(['MONGO_URI', 'API_URL']);
```

## Environment Variables

### API Server
- `PORT_API` or `PORT` - Server port (default: 2000)
- `HOST` - Server host (default: 0.0.0.0)
- `CORS_ORIGIN` - CORS origin (default: *)
- `MONGO_URI` - MongoDB connection string (default: mongodb://localhost:27017/quick-sync)

### WebSocket Server
- `PORT_WS` or `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)

### Web App & Extension
- `VITE_API_URL` or `API_URL` - API server URL (default: http://localhost:2000)
- `VITE_WS_URL` or `WS_URL` - WebSocket server URL (default: http://localhost:3000)
- `VITE_HOST_URL` or `HOST_URL` - Web app URL (default: http://localhost:5173)
- `VITE_SESSION_STORE` or `SESSION_STORE` - Session store type (default: Express)
- `VITE_SIGNALING` or `SIGNALING` - Signaling method (default: WebSocket)

## License

MIT
