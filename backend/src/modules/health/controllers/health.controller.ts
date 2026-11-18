import { Controller, Get, ServiceUnavailableException, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Publica } from '../../../common/index.js';
import { SupabaseService } from '../../../database/supabase/supabase.service.js';

/**
 * Sondas para Docker / Kubernetes / Cloud Run:
 *  - /api/health        → el proceso vive (liveness)
 *  - /api/health/ready  → puede atender: Supabase responde (readiness)
 */
@ApiTags('Salud')
@Publica()
@SkipThrottle()
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get()
  vivo() {
    return { estado: 'ok', uptime: Math.round(process.uptime()) };
  }

  @Get('ready')
  async listo() {
    if (!(await this.supabase.disponible())) {
      throw new ServiceUnavailableException({ estado: 'error', supabase: 'sin respuesta' });
    }
    return { estado: 'ok', supabase: 'ok' };
  }
}
