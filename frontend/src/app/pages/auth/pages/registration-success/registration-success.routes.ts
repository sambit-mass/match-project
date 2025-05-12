import { Routes } from '@angular/router';
import { regSuccessGuard } from '@app/core/guards/registration-success.guard';

export const routes: Routes = [
  { path: 'reg-success', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    canActivate: [regSuccessGuard],
    title: 'Partner Preference',
    loadComponent: () => import('./pages').then(c => c.ThankyouComponent),
  },
];
