import { Routes } from '@angular/router';
import { introductionGuard } from '@app/core/guards';

export const routes: Routes = [
  { path: 'introduction', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    // canActivate: [introductionGuard],
    title: 'Introduction',
    loadComponent: () =>
      import('./pages/introduction/introduction.component').then(c => c.IntroductionComponent),
  },
];
