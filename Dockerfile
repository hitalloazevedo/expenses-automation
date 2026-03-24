# ---------- 1. Base ----------
FROM node:20-alpine AS base
WORKDIR /app

# ---------- 2. Dependencies ----------
FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

# ---------- 3. Build ----------
FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ---------- 4. Production ----------
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copia apenas o necessário
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

# segurança: não rodar como root
USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]