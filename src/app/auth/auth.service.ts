import { DestroyRef, Injectable, inject } from '@angular/core';
import { BehaviorSubject, filter } from 'rxjs';
import { User } from 'firebase/auth';
import { AUTH_DRIVER } from './auth-driver';

export type AccessStatus = 'loading' | 'anonymous' | 'authorized' | 'error';
export interface AccessState { status: AccessStatus; }

export function loginError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code === 'auth/network-request-failed') return 'No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.';
  if (code === 'auth/too-many-requests') return 'Hay demasiados intentos. Espera un momento antes de volver a intentar.';
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email', 'auth/user-disabled'].includes(code ?? '')) {
    return 'No fue posible iniciar sesión con esas credenciales.';
  }
  return 'No se pudo iniciar la sesión. Inténtalo más tarde.';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly driver = inject(AUTH_DRIVER);
  private readonly subject = new BehaviorSubject<AccessState>({ status: 'loading' });
  readonly state$ = this.subject.asObservable();
  readonly resolved$ = this.state$.pipe(filter(state => state.status !== 'loading'));
  private initializedOk = false;
  private locallyBlocked = false;
  private readonly initialized: Promise<void>;

  constructor() {
    let unwatch: (() => void) | undefined;
    let destroyed = false;
    inject(DestroyRef).onDestroy(() => { destroyed = true; unwatch?.(); });
    this.initialized = this.driver.initialize().then(() => {
      if (destroyed) return;
      unwatch = this.driver.watch(user => { void this.resolveUser(user); }, () => this.failClosed());
      this.initializedOk = true;
    }).catch(() => this.failClosed());
  }

  private resolveUser(user: User | null): void {
    if (this.locallyBlocked || !user) {
      this.subject.next({ status: 'anonymous' });
      return;
    }
    this.subject.next({ status: 'authorized' });
  }

  private failClosed(): void {
    this.subject.next({ status: 'error' });
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.initialized;
    if (!this.initializedOk) throw new Error('No se pudo preparar la sesión. Recarga e inténtalo de nuevo.');
    this.locallyBlocked = false;
    this.subject.next({ status: 'loading' });
    try {
      const user = await this.driver.login(email.trim(), password);
      this.resolveUser(user);
    } catch (error) {
      this.subject.next({ status: 'anonymous' });
      throw new Error(loginError(error));
    }
  }

  async signOut(): Promise<void> {
    // Block locally before awaiting the SDK, including if signOut fails.
    this.locallyBlocked = true;
    this.subject.next({ status: 'anonymous' });
    try {
      await this.driver.logout();
    } catch {
      this.failClosed();
      throw new Error('No se pudo completar el cierre de sesión. Inténtalo de nuevo.');
    }
  }
}
