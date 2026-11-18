#!/bin/sh
# Genera /config.json a partir de variables de entorno al arrancar el contenedor.
# Así la MISMA imagen sirve para dev y prod: solo cambian las variables.
set -eu

DESTINO=/usr/share/nginx/html/config.json

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_KEY:-}" ]; then
  echo "[coldwork] ERROR: faltan SUPABASE_URL o SUPABASE_KEY" >&2
  exit 1
fi

case "$SUPABASE_KEY" in
  sb_secret_*)
    echo "[coldwork] ERROR: SUPABASE_KEY es una SECRET key. Usa la publishable key." >&2
    exit 1 ;;
esac

cat > "$DESTINO" <<EOF
{
  "supabaseUrl": "${SUPABASE_URL}",
  "supabaseKey": "${SUPABASE_KEY}",
  "apiUrl": "${API_URL:-/api}",
  "entorno": "${APP_ENTORNO:-prod}",
  "primeLicense": "${PRIME_LICENSE:-}"
}
EOF

echo "[coldwork] config.json generado (entorno: ${APP_ENTORNO:-prod})"
