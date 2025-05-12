import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then(r => r.routes),
  },
  {
    path: 'profile',
    title: 'Profile',
    loadChildren: () => import('./profile/profile.routes').then(r => r.routes),
  },
];
