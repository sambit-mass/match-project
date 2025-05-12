import { Routes } from '@angular/router';
import { authGuard, webGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    canActivate: [webGuard],
    title: 'Match By Ai',
    loadComponent: () => import('./pages/common/pages').then(c => c.LandingPageComponent),
  },
  {
    path: '',

    loadComponent: () =>
      import('./core/layouts/auth/auth-layout/auth-layout.component').then(
        c => c.AuthLayoutComponent
      ),
    loadChildren: () => import('./pages/auth/auth.routes').then(r => r.routes),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layouts/web/web-layout/web-layout.component').then(c => c.WebLayoutComponent),
    loadChildren: () => import('./pages/web/web.routes').then(r => r.routes),
  },
  {
    path: 'not-found',
    loadComponent: () => import('./pages/common/pages').then(c => c.NotFoundComponent),
  },
  {
    path: '**',
    redirectTo: '/not-found',
  },
];
