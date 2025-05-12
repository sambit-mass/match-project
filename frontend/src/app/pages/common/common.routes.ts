import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Match By Ai',
    loadComponent: () => import('./pages').then(c => c.LandingPageComponent),
  },
  {
    path: 'not-found',
    title: 'Not Found',
    loadComponent: () => import('./pages').then(c => c.NotFoundComponent),
  },
];
