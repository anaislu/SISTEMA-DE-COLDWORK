# ---------- Fase 1: compilar ----------
FROM node:24-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build && npm prune --omit=dev

# ---------- Fase 2: imagen mínima de ejecución ----------
FROM node:24-alpine
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app

# Solo lo necesario para ejecutar (sin código fuente ni devDependencies)
COPY --from=build --chown=node:node /src/package.json ./
COPY --from=build --chown=node:node /src/node_modules ./node_modules
COPY --from=build --chown=node:node /src/dist ./dist

# Nunca correr como root
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:${PORT}/api/health || exit 1

# node directo (no npm) → recibe SIGTERM y cierra ordenado
CMD ["node", "dist/main.js"]
