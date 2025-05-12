import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(c => c.DashboardComponent),
  },
];
