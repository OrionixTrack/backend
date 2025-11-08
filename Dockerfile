FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm ci

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/common/migrations ./src/common/migrations
COPY --from=builder /app/src/data-source.ts ./src/data-source.ts
COPY --from=builder /app/src/common/entities ./src/common/entities

EXPOSE 3000

CMD ["node", "dist/main.js"]