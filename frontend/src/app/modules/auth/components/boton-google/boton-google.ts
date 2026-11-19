import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../../core/auth/services/auth.service';

/**
 * "Continuar con Google" (sirve para entrar y para crear cuenta).
 * Si Google aún no está activado en Supabase, se muestra deshabilitado con aviso.
 */
@Component({
  selector: 'app-boton-google',
  imports: [ButtonModule, MessageModule],
  template: `
    <div class="separador"><span>o</span></div>
    <p-button
      label="Continuar con Google"
      icon="pi pi-google"
      severity="secondary"
      [outlined]="true"
      styleClass="w-full"
      [loading]="cargando()"
      [disabled]="activo() === false"
      (onClick)="entrar()"
    />
    @if (activo() === false) {
      <small class="aviso">El inicio con Google se activa pronto. Por ahora usa tu correo.</small>
    }
    @if (error()) {
      <p-message severity="error">{{ error() }}</p-message>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; }
    .separador { display: flex; align-items: center; gap: 0.75rem; color: var(--p-text-muted-color); font-size: 0.85rem; }
    .separador::before, .separador::after { content: ''; flex: 1; height: 1px; background: var(--p-content-border-color); }
    .aviso { color: var(--p-text-muted-color); font-size: 0.78rem; text-align: center; }
  `,
})
export class BotonGoogle implements OnInit {
  private readonly auth = inject(AuthService);
  /** null = todavía consultando. */
  protected readonly activo = signal<boolean | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  async ngOnInit() {
    this.activo.set(await this.auth.googleActivo());
  }

  async entrar() {
    this.cargando.set(true);
    this.error.set(null);
    const err = await this.auth.entrarConGoogle(); // si va bien, el navegador se va a Google
    if (err) {
      this.error.set(err);
      this.cargando.set(false);
    }
  }
}
