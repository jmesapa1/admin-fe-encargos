import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';
import { map, take } from 'rxjs';
import { AccessState, AuthService } from './auth.service';

export function accessDestination(state: AccessState, router: Router, returnUrl: string): true | UrlTree {
  if (state.status === 'authorized') return true;
  if (state.status === 'error') return router.createUrlTree(['/sesion-error']);
  return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
}

export const adminGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  return inject(AuthService).resolved$.pipe(take(1), map(access => accessDestination(access, router, state.url)));
};
export const adminChildGuard: CanActivateChildFn = (route, state) => adminGuard(route, state);
export const adminMatchGuard: CanMatchFn = (_route, segments) => {
  const router = inject(Router);
  const url = router.getCurrentNavigation()?.extractedUrl.toString() ?? '/' + segments.map(s => s.path).join('/');
  return inject(AuthService).resolved$.pipe(take(1), map(access => accessDestination(access, router, url)));
};

export function safeReturnUrl(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return '/home';
  if (/^\/(login|auth|sesion-error)([/?#;]|$)/i.test(value)) return '/home';
  return value;
}
