import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./auth-pages.scss']
})
export default class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  busy = false;
  restoring = true;
  error = '';
  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });
  constructor() {
    this.auth.state$.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(state => {
      this.restoring = state.status === 'loading';
      if (state.status === 'authorized') {
        void this.router.navigateByUrl('/pedidos', { replaceUrl: true });
      } else if (state.status === 'error') {
        this.error = 'No se pudo verificar la sesión. Revisa tu conexión e inténtalo de nuevo.';
      }
    });
  }
  async submit(): Promise<void> {
    if (this.form.invalid || this.busy || this.restoring) { this.form.markAllAsTouched(); return; }
    this.busy = true;
    this.error = '';
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.signIn(email, password);
    } catch (error) {
      this.error = (error as Error).message;
    } finally {
      this.form.controls.password.reset();
      this.busy = false;
    }
  }
}
