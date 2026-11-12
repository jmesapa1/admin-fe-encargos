import { TestBed } from '@angular/core/testing';
import { User } from 'firebase/auth';
import { AUTH_DRIVER, AuthDriver } from './auth-driver';
import { AccessState, AuthService, loginError } from './auth.service';

export class FakeAuthDriver implements AuthDriver {
  next: (user: User | null) => void = () => undefined;
  fail: () => void = () => undefined;
  initialize = jasmine.createSpy('initialize').and.resolveTo();
  login = jasmine.createSpy('login').and.resolveTo({ uid: 'fictional-user' } as User);
  logout = jasmine.createSpy('logout').and.resolveTo();
  unwatch = jasmine.createSpy('unwatch');
  watch(next: (user: User | null) => void, error: () => void): () => void {
    this.next = next; this.fail = error; return this.unwatch;
  }
}
export async function settle(): Promise<void> { for (let i = 0; i < 10; i++) await Promise.resolve(); }

describe('AuthService — synthetic accounts only', () => {
  let driver: FakeAuthDriver;
  let service: AuthService;
  let state: AccessState;
  beforeEach(async () => {
    driver = new FakeAuthDriver();
    TestBed.configureTestingModule({ providers: [{ provide: AUTH_DRIVER, useValue: driver }] });
    service = TestBed.inject(AuthService);
    service.state$.subscribe(value => state = value);
    await settle();
  });
  it('waits for the first restored auth state', () => {
    expect(state.status).toBe('loading');
    driver.next(null);
    expect(state.status).toBe('anonymous');
  });
  it('restores an authenticated session', async () => {
    driver.next({ uid: 'fictional-user' } as User);
    await settle();
    expect(state.status).toBe('authorized');
    expect(driver.initialize).toHaveBeenCalledTimes(1);
  });
  it('logs in with email and password without retaining the password', async () => {
    await service.signIn(' fictional@example.test ', 'Synthetic-test-password');
    expect(driver.login).toHaveBeenCalledWith('fictional@example.test', 'Synthetic-test-password');
    expect(state.status).toBe('authorized');
  });
  it('maps invalid credentials without exposing Firebase error details', async () => {
    driver.login.and.rejectWith({ code: 'auth/invalid-credential', message: 'DO NOT SHOW' });
    await expectAsync(service.signIn('fictional@example.test', 'synthetic-wrong')).toBeRejectedWithError('No fue posible iniciar sesión con esas credenciales.');
    expect(state.status).toBe('anonymous');
  });
  it('maps network and rate-limit errors to generic messages', () => {
    expect(loginError({ code: 'auth/network-request-failed' })).toContain('conexión');
    expect(loginError({ code: 'auth/too-many-requests' })).toContain('Espera');
    expect(loginError({ message: 'DO NOT SHOW' })).not.toContain('DO NOT SHOW');
  });
  it('does not restore an authenticated state after logout', async () => {
    driver.next({ uid: 'fictional-user' } as User);
    await service.signOut();
    driver.next({ uid: 'fictional-user' } as User);
    await settle();
    expect(state.status).toBe('anonymous');
  });
  it('blocks locally even if Firebase logout fails', async () => {
    driver.logout.and.rejectWith(new Error('synthetic network failure'));
    await expectAsync(service.signOut()).toBeRejected();
    expect(state.status).toBe('error');
    driver.next({ uid: 'fictional-user' } as User);
    await settle();
    expect(state.status).not.toBe('authorized');
  });
  it('reacts to sign-out and authenticated session updates from the SDK', async () => {
    driver.next({ uid: 'fictional-user' } as User);
    await settle();
    expect(state.status).toBe('authorized');
    driver.next({ uid: 'fictional-user' } as User);
    await settle();
    expect(state.status).toBe('authorized');
    driver.next(null);
    expect(state.status).toBe('anonymous');
  });
  it('does not allow an in-flight login to undo a later logout', async () => {
    let resolve!: (user: User) => void;
    driver.login.and.returnValue(new Promise<User>(done => resolve = done));
    const login = service.signIn('fictional@example.test', 'fictional-password');
    await settle();
    await service.signOut();
    resolve({ uid: 'fictional-user' } as User);
    await login;
    expect(state.status).toBe('anonymous');
  });
  it('unsubscribes from Firebase when destroyed', () => {
    TestBed.resetTestingModule();
    expect(driver.unwatch).toHaveBeenCalled();
  });
});
