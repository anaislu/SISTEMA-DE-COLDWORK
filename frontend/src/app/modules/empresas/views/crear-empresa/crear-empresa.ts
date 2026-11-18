import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { EmpresaActualService } from '../../../../core/empresa/services/empresa-actual.service';
import { Emoji } from '../../../../shared/components/emoji/emoji';
import { EmpresasService } from '../../services/empresas.service';

/** Vista: primera vez sin empresa → crear la empresa (quien la crea queda como dueño). */
@Component({
  selector: 'app-crear-empresa',
  imports: [FormsModule, ButtonModule, InputTextModule, MessageModule, Emoji],
  templateUrl: './crear-empresa.html',
  styleUrl: './crear-empresa.scss',
})
export class CrearEmpresa {
  private readonly empresas = inject(EmpresasService);
  private readonly empresaActual = inject(EmpresaActualService);
  private readonly router = inject(Router);
  private readonly avisos = inject(MessageService);

  razonSocial = '';
  ruc = '';
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  async crear() {
    const ruc = this.ruc.trim();
    if (this.razonSocial.trim().length < 2) return this.error.set('Escribe la razón social.');
    if (ruc && !/^(10|15|17|20)\d{9}$/.test(ruc)) return this.error.set('El RUC debe tener 11 dígitos (empieza con 10, 15, 17 o 20).');

    this.cargando.set(true);
    this.error.set(null);
    try {
      const { id } = await this.empresas.crear({ razonSocial: this.razonSocial.trim(), ruc: ruc || undefined });
      this.empresaActual.cargar(await this.empresas.mias());
      this.empresaActual.elegir(id);
      this.avisos.add({ severity: 'success', summary: 'Empresa creada', detail: 'Ya eres el dueño.', life: 4000 });
      await this.router.navigateByUrl('/');
    } catch (e) {
      const msg = (e as HttpErrorResponse)?.error?.message;
      this.error.set(Array.isArray(msg) ? msg.join(' · ') : (msg ?? 'No se pudo crear la empresa.'));
    } finally {
      this.cargando.set(false);
    }
  }
}
