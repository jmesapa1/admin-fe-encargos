import { DestroyRef, Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService, AccessState } from './auth.service';
import { accessDestination } from './auth.guards';

@Injectable({ providedIn: 'root' })
export class AuthNavigationService {
  private state: AccessState = { status: 'loading' };
  private readonly router = inject(Router);
  private readonly modals = inject(NgbModal);
  constructor() {
    const destroyRef = inject(DestroyRef);
    inject(AuthService).state$.pipe(takeUntilDestroyed(destroyRef)).subscribe(state => {
      if (this.state.status === 'authorized' && state.status !== 'authorized') this.modals.dismissAll('session-changed');
      this.state = state;
      this.redirectIfPrivate();
    });
    this.router.events.pipe(takeUntilDestroyed(destroyRef)).subscribe(event => {
      if (event instanceof NavigationEnd) this.redirectIfPrivate();
    });
  }
  private redirectIfPrivate(): void {
    let route = this.router.routerState.snapshot.root;
    let privateRoute = false;
    while (route) {
      privateRoute ||= route.data['admin'] === true;
      if (!route.firstChild) break;
      route = route.firstChild;
    }
    if (!privateRoute || this.state.status === 'loading' || this.state.status === 'authorized') return;
    const target = accessDestination(this.state, this.router, this.router.url);
    if (target !== true) void this.router.navigateByUrl(target, { replaceUrl: true });
  }
}
