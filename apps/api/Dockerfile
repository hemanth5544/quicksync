#Builder Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.* .
COPY . .

ENV PATH="/app/node_modules/.bin:/app/packages/logger/node_modules/.bin:/app/apps/api/node_modules/.bin:$PATH"

RUN npm install
RUN npm run build --workspace=@quick-sync/logger
RUN npm run build --workspace=@quick-sync/session-api

#Runtime

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/apps/api/package.json .
COPY --from=builder /app/apps/api/dist/ /app/dist/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages/logger /app/packages/logger

EXPOSE 2000

CMD ["npm","run","start"]
