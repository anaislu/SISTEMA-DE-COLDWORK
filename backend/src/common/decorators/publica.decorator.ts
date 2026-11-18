import { SetMetadata } from '@nestjs/common';

export const ES_PUBLICA = 'coldwork:publica';

/** La ruta no exige token (ej. /health). Por defecto TODO exige token. */
export const Publica = () => SetMetadata(ES_PUBLICA, true);
