import { bootstrapApplication } from '@angular/platform-browser';
import { crearAppConfig } from './app/app.config';
import { App } from './app/app';
import { cargarConfig } from './app/core/config/runtime-config';

// Primero se lee /config.json (URL y key de Supabase) y luego arranca Angular.
cargarConfig()
  .then(() => bootstrapApplication(App, crearAppConfig()))
  .catch((err) => {
    console.error(err);
    document.body.innerHTML = `<div style="font-family:system-ui;padding:2rem;color:#b91c1c">
      <h2>COLDWORK no pudo iniciar</h2><p>${String(err?.message ?? err)}</p></div>`;
  });
