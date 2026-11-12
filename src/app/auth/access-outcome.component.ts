import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-access-outcome',
  imports: [CommonModule],
  styleUrls: ['./auth-pages.scss'],
  template: `
    <main class="auth-page"><section class="outcome" aria-labelledby="access-title">
      <span class="eyebrow">LOS ENCARGOS DE SALOMÓN</span>
      <h1 id="access-title">No pudimos verificar tu sesión</h1>
      <p class="intro">Por seguridad, el panel permanece cerrado. Revisa tu conexión y vuelve a iniciar sesión.</p>
      <p class="message error" role="alert" *ngIf="error">{{ error }}</p>
      <button class="primary-button" type="button" [disabled]="busy" (click)="logout()">{{ busy ? 'Cerrando sesión…' : 'Cerrar sesión y volver al inicio' }}</button>
    </section></main>`
})
export default class AccessOutcomeComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  busy = false;
  error = '';
  async logout(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    try { await this.auth.signOut(); await this.router.navigateByUrl('/login', { replaceUrl: true }); }
    catch { this.error = 'No se pudo completar el cierre de sesión. Inténtalo de nuevo.'; }
    finally { this.busy = false; }
  }
}
