import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import LoginComponent from './login.component';
import { AccessState, AuthService } from './auth.service';

describe('Login screen', () => {
  let state: BehaviorSubject<AccessState>;
  let signIn: jasmine.Spy;
  let router: jasmine.SpyObj<Router>;
  beforeEach(async () => {
    state = new BehaviorSubject<AccessState>({ status: 'anonymous' });
    signIn = jasmine.createSpy('signIn').and.resolveTo();
    router = jasmine.createSpyObj('router', ['navigateByUrl']);
    router.navigateByUrl.and.resolveTo(true);
    await TestBed.configureTestingModule({ imports: [LoginComponent], providers: [
      { provide: AuthService, useValue: { state$: state.asObservable(), signIn } },
      { provide: Router, useValue: router }
    ] }).compileComponents();
  });
  it('renders accessible credentials fields without public registration', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[autocomplete="username"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('input[autocomplete="current-password"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a[href*="signup"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBeFalse();
  });
  it('prevents empty submissions and simultaneous login attempts', async () => {
    const component = TestBed.createComponent(LoginComponent).componentInstance;
    await component.submit();
    expect(signIn).not.toHaveBeenCalled();
    let resolve!: () => void;
    signIn.and.returnValue(new Promise<void>(done => resolve = done));
    component.form.setValue({ email: 'fictional@example.test', password: 'fictional-password' });
    const pending = component.submit();
    await component.submit();
    expect(signIn).toHaveBeenCalledTimes(1);
    resolve();
    await pending;
    expect(component.form.controls.password.value).toBe('');
  });
  it('waits for restoration and navigates to the protected return destination', () => {
    state.next({ status: 'loading' });
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBeTrue();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    state.next({ status: 'authorized' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/pedidos', { replaceUrl: true });
  });
  it('navigates to pedidos after successful login', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    state.next({ status: 'authorized' });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/pedidos', { replaceUrl: true });
  });
  it('displays a controlled login error without retaining a password', async () => {
    signIn.and.rejectWith(new Error('No fue posible iniciar sesión con esas credenciales.'));
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.form.setValue({ email: 'fictional@example.test', password: 'fictional-password' });
    await component.submit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('esas credenciales');
    expect(component.form.controls.password.value).toBe('');
  });
});
