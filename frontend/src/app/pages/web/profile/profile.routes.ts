import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Profile',
    loadComponent: () => import('./pages/profile/profile.component').then(c => c.ProfileComponent),
  },
];
