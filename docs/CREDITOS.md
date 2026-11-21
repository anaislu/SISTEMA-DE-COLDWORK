# Créditos de íconos

Los emojis ilustrados de COLDWORK (`copo`, `saludo`, `correo`, `edificio`) son **SVG propios** del proyecto, guardados en `frontend/public/emojis/`. Los sirve la misma app: cargan siempre (aunque la red del cliente bloquee sitios externos), se ven nítidos al imprimir y **no piden atribución**.

Antes se cargaban por link desde Flaticon; se cambió porque si ese servidor fallaba o estaba bloqueado, el emoji aparecía roto.

Para agregar uno nuevo: guarda el SVG en `frontend/public/emojis/<nombre>.svg` y agrégalo en `frontend/src/app/shared/components/emoji/iconos.ts`.

Los íconos de interfaz (botones y menú) son **PrimeIcons**, que vienen con PrimeNG y tienen licencia MIT.
