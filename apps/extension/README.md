# Quick Sync Browser Extension

Browser extension built with [Plasmo](https://www.plasmo.com) framework for Quick Sync.

## What is Plasmo?

Plasmo is a browser extension framework that makes it easy to build extensions with React, TypeScript, and modern tooling. It handles:
- Manifest generation
- Hot module replacement (HMR)
- Build optimization
- TypeScript support
- React integration

## Development

### From the root (monorepo):
```bash
# Start all apps including extension
npm run dev

# Or just the extension
turbo dev --filter=@quick-sync/extension
```

### From the extension directory:
```bash
cd apps/extension
npm run dev
```

This will:
- Start the Plasmo dev server
- Watch for file changes
- Generate the extension in `.plasmo/` directory
- Provide hot reloading

## Building

### From the root:
```bash
npm run build
# or
turbo build --filter=@quick-sync/extension
```

### From the extension directory:
```bash
cd apps/extension
npm run build
```

This creates a production build in the `build/` directory.

## Loading the Extension

1. Build the extension: `npm run build`
2. Open Chrome/Edge: `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `build/chrome-mv3` directory (or `build/firefox-mv2` for Firefox)

## Project Structure

```
apps/extension/
├── popup.tsx          # Extension popup UI (React component)
├── content.ts        # Content script (optional)
├── background.ts     # Background/service worker (optional)
├── options.tsx       # Options page (optional)
├── assets/           # Static assets (icons, images)
├── package.json      # Dependencies and scripts
└── tsconfig.json     # TypeScript configuration
```

## Plasmo Features

- **File-based routing**: Create `popup.tsx`, `content.ts`, `background.ts`, etc.
- **React support**: Use React components out of the box
- **TypeScript**: Full TypeScript support
- **Hot reload**: Changes reflect immediately during development
- **Multi-browser**: Builds for Chrome, Firefox, Edge automatically

## Adding New Features

### Create a popup:
- File: `popup.tsx` (already exists)
- Automatically becomes the extension popup

### Create a content script:
- File: `content.ts` or `content.tsx`
- Runs on web pages

### Create a background script:
- File: `background.ts` or `background.tsx`
- Runs as a service worker (Chrome) or background page (Firefox)

### Create an options page:
- File: `options.tsx`
- Accessible from extension settings

## Monorepo Integration

This extension is part of the Quick Sync monorepo:
- Uses Turborepo for task orchestration
- Shares TypeScript configuration
- Can import shared packages from `packages/` directory
- Builds are cached by Turborepo

## Resources

- [Plasmo Documentation](https://docs.plasmo.com)
- [Plasmo Examples](https://github.com/PlasmoHQ/examples)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
