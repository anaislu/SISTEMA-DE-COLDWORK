# ---------- Fase 1: compilar Angular ----------
FROM node:24-alpine AS build
WORKDIR /src

# Primero solo las dependencias (se cachean si package*.json no cambia)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx ng build --configuration production

# ---------- Fase 2: servir con nginx ----------
FROM nginx:1.29-alpine

# Config de nginx (rutas SPA, caché, cabeceras de seguridad)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Script que genera /config.json desde variables de entorno al arrancar
COPY docker/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

COPY --from=build /src/dist/app/browser /usr/share/nginx/html

# Valores por defecto (se sobrescriben con -e o en la nube)
ENV SUPABASE_URL="" \
    SUPABASE_KEY="" \
    API_URL="/api" \
    APP_ENTORNO="prod" \
    PRIME_LICENSE=""

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
