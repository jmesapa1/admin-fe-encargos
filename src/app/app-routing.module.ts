// Angular Import
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// project import
import { AdminComponent } from './theme/layout/admin/admin.component';
import { adminGuard, adminChildGuard, adminMatchGuard } from './auth/auth.guards';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./auth/login.component') },
  { path: 'sesion-error', loadComponent: () => import('./auth/access-outcome.component') },
  { path: 'auth/signin', redirectTo: 'login', pathMatch: 'full' },
  { path: 'auth/signup', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '',
    component: AdminComponent,
    canMatch: [adminMatchGuard],
    canActivate: [adminGuard],
    canActivateChild: [adminChildGuard],
    runGuardsAndResolvers: 'always',
    data: { admin: true },
    children: [
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./demo/dashboard/dash-analytics.component')
      },
      {
        path: 'component',
        loadChildren: () => import('./demo/ui-element/ui-basic.module').then((m) => m.UiBasicModule)
      },
      {
        path: 'chart',
        loadComponent: () => import('./demo/chart & map/core-apex.component')
      },
      {
        path: 'forms',
        loadComponent: () => import('./demo/forms & tables/form-elements/form-elements.component')
      },
      {
        path: 'tables',
        loadComponent: () => import('./demo/forms & tables/tbl-bootstrap/tbl-bootstrap.component')
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./demo/pedidos/pedidos.component')
      },
      {
        path: 'control-gastos',
        loadComponent: () => import('./demo/control-gastos/control-gastos.component')
      }
    ]
  },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
