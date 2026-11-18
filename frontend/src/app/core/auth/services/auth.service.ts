import { computed, inject, Injectable, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from '../../supabase/services/supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;

  /** undefined = todavía no sabemos; null = sin sesión. */
  readonly session = signal<Session | null | undefined>(undefined);
  readonly usuario = computed(() => this.session()?.user ?? null);
  readonly logueado = computed(() => !!this.session());

  private listo: Promise<void>;

  constructor() {
    this.listo = this.supabase.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
    });
    this.supabase.auth.onAuthStateChange((_evento, session) => this.session.set(session));
  }

  /** Espera a que se sepa si hay sesión (lo usan los guards). */
  esperar(): Promise<void> {
    return this.listo;
  }

  async entrarConCorreo(correo: string, clave: string): Promise<string | null> {
    const { error } = await this.supabase.auth.signInWithPassword({ email: correo, password: clave });
    return error ? traducirError(error.message) : null;
  }

  async salir(): Promise<void> {
    await this.supabase.auth.signOut({ scope: 'local' });
  }
}

function traducirError(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return 'Correo o contraseña incorrectos.';
  if (/email not confirmed/i.test(msg)) return 'Confirma tu correo antes de entrar.';
  if (/fetch|network/i.test(msg)) return 'Sin conexión con el servidor.';
  return msg;
}
