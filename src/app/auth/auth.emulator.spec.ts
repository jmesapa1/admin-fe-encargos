import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { FirebaseApp, deleteApp, initializeApp } from 'firebase/app';
import {
  Auth as FirebaseAuth, connectAuthEmulator, getAuth,
  signOut
} from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

// This suite talks only to a loopback emulator with a fictional demo project.
// It never imports the application's production Firebase configuration.
describe('Firebase Auth Emulator integration', () => {
  const projectId = 'demo-leds-local';
  const appName = `leds-auth-tests-${Date.now()}`;
  const endpoint = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/';
  const config = { apiKey: 'demo-local-key', projectId, appId: 'demo-local-app' };
  let app: FirebaseApp;
  let auth: FirebaseAuth;
  let email: string;
  const password = 'Fictional-test-password-123';
  let uid: string;

  async function request(method: string, body: object): Promise<Record<string, any>> {
    const response = await fetch(endpoint + method + '?key=demo-local-key', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error('Local emulator fixture setup failed; no response details logged.');
    return response.json();
  }
  function setupApp(): void {
    app = initializeApp(config, appName);
    auth = getAuth(app);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  }
  function setupService(): AuthService {
    TestBed.configureTestingModule({ providers: [{ provide: Auth, useValue: auth }] });
    return TestBed.inject(AuthService);
  }
  beforeAll(setupApp);
  beforeEach(async () => {
    await signOut(auth);
    email = `fictional-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
    const account = await request('accounts:signUp', { email, password, returnSecureToken: true });
    uid = account['localId'];
  });
  afterEach(async () => { await signOut(auth); await request('accounts:delete', { localId: uid }); });
  afterAll(async () => { await signOut(auth); await deleteApp(app); });

  it('authorizes any successfully authenticated account', async () => {
    const service = setupService();
    await firstValueFrom(service.resolved$);
    await service.signIn(email, password);
    expect((await firstValueFrom(service.resolved$)).status).toBe('authorized');
  });
  it('rejects incorrect credentials using the real SDK', async () => {
    const service = setupService();
    await firstValueFrom(service.resolved$);
    await expectAsync(service.signIn(email, 'fictional-wrong-password')).toBeRejected();
    expect((await firstValueFrom(service.resolved$)).status).toBe('anonymous');
  });
  it('restores an authenticated session after app recreation', async () => {
    let service = setupService();
    await firstValueFrom(service.resolved$);
    await service.signIn(email, password);
    expect((await firstValueFrom(service.resolved$)).status).toBe('authorized');
    expect(auth.currentUser).not.toBeNull();
    TestBed.resetTestingModule();
    await deleteApp(app);
    setupApp();
    service = setupService();
    expect((await firstValueFrom(service.resolved$)).status).toBe('authorized');
    await service.signOut();
    expect((await firstValueFrom(service.resolved$)).status).toBe('anonymous');
    expect(auth.currentUser).toBeNull();
  });
});
