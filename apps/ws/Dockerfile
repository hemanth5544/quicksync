#Builder Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./

COPY apps/ws/package.json apps/ws/package.json
COPY packages/logger/package.json packages/logger/package.json

RUN npm install

COPY apps/ws ./apps/ws
COPY packages/logger ./packages/logger

RUN npm run build --workspace=@quick-sync/logger
RUN npm run build --workspace=@quick-sync/ws-server

#Runtime

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/apps/ws/package.json .
COPY --from=builder /app/apps/ws/dist /app/dist
COPY --from=builder /app/packages/logger /app/packages/logger
COPY --from=builder /app/node_modules ./node_modules

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

CMD ["node", "dist/index.js"]

