import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, RouterOutlet, Routes, provideRouter } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingHarness } from '@angular/router/testing';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { routes as appRoutes } from '../app-routing.module';
import { AccessState, AuthService } from './auth.service';
import { filter } from 'rxjs';
import { AuthNavigationService } from './auth-navigation.service';
import { safeReturnUrl } from './auth.guards';

@Component({ standalone: true, imports: [RouterOutlet], template: 'Synthetic shell <router-outlet />' })
class Shell {}
@Component({ standalone: true, template: 'Synthetic screen' })
class Screen {}

describe('Administrative routing', () => {
  let state: BehaviorSubject<AccessState>;
  let router: Router;
  let harness: RouterTestingHarness;
  let lazy: jasmine.Spy;
  beforeEach(async () => {
    state = new BehaviorSubject<AccessState>({ status: 'loading' });
    lazy = jasmine.createSpy('lazy module').and.callFake(async () => [{ path: 'nested', component: Screen }]);
    const admin = appRoutes.find(route => route.data?.['admin']);
    if (!admin) throw new Error('Missing protected administrative route');
    const routes: Routes = [
      { path: 'login', component: Screen },
      { path: 'sesion-error', component: Screen },
      { ...admin, component: Shell, children: [
        { path: '', redirectTo: '/home', pathMatch: 'full' },
        { path: 'home', component: Screen },
        { path: 'pedidos', component: Screen },
        { path: 'component', loadChildren: lazy }
      ] }
    ];
    TestBed.configureTestingModule({ providers: [provideRouter(routes), { provide: NgbModal, useValue: { dismissAll: jasmine.createSpy('dismissAll') } }, {
      provide: AuthService, useValue: { state$: state.asObservable(), resolved$: state.pipe(filter(s => s.status !== 'loading')) }
    }] });
    router = TestBed.inject(Router);
    TestBed.inject(AuthNavigationService);
    harness = await RouterTestingHarness.create();
  });
  it('redirects anonymous public entry to login', async () => {
    state.next({ status: 'anonymous' });
    await harness.navigateByUrl('/');
    expect(router.url).toContain('/login');
  });
  it('does not redirect while restoring a session on direct navigation', async () => {
    let completed = false;
    const navigation = harness.navigateByUrl('/pedidos').then(() => completed = true);
    await Promise.resolve();
    expect(completed).toBeFalse();
    state.next({ status: 'authorized' });
    await navigation;
    expect(router.url).toBe('/pedidos');
  });
  it('fails closed on session errors', async () => {
    state.next({ status: 'error' });
    await harness.navigateByUrl('/home');
    expect(router.url).toBe('/sesion-error');
  });
  it('prevents anonymous lazy module loading', async () => {
    state.next({ status: 'anonymous' });
    await harness.navigateByUrl('/component/nested');
    expect(router.url).toContain('/login');
    expect(lazy).not.toHaveBeenCalled();
  });
  it('allows authorized lazy-loaded child routes', async () => {
    state.next({ status: 'authorized' });
    await harness.navigateByUrl('/component/nested');
    expect(router.url).toBe('/component/nested');
    expect(lazy).toHaveBeenCalledTimes(1);
  });
  it('evicts the active panel on logout and denies browser-back/direct access', async () => {
    state.next({ status: 'authorized' });
    await harness.navigateByUrl('/home');
    const redirected = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationEnd && event.urlAfterRedirects.startsWith('/login'))));
    state.next({ status: 'anonymous' });
    await redirected;
    await harness.navigateByUrl('/pedidos');
    expect(router.url).toContain('/login');
    expect(TestBed.inject(NgbModal).dismissAll).toHaveBeenCalled();
  });
  it('keeps authenticated child navigation available after the shell is mounted', async () => {
    state.next({ status: 'authorized' });
    await harness.navigateByUrl('/home');
    state.next({ status: 'authorized' });
    await harness.navigateByUrl('/component/nested');
    expect(router.url).toBe('/component/nested');
  });
  it('contains no public registration route and protects the actual root tree', () => {
    const admin = appRoutes.find(route => route.data?.['admin']);
    expect(admin?.canMatch?.length).toBeGreaterThan(0);
    expect(admin?.canActivateChild?.length).toBeGreaterThan(0);
    expect(appRoutes.find(route => route.path === 'auth/signup')?.redirectTo).toBe('login');
  });
  it('only accepts internal return destinations', () => {
    for (const url of ['https://example.test', '//example.test', '/\\example.test', '/login', '/auth/signup']) {
      expect(safeReturnUrl(url)).toBe('/home');
    }
    expect(safeReturnUrl('/pedidos?filtro=pendiente')).toBe('/pedidos?filtro=pendiente');
  });
});
