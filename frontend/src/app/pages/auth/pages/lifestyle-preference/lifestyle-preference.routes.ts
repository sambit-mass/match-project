import { Routes } from '@angular/router';
import { lifeStylePreferenceGuard } from '@app/core/guards/lifestyle-Preference.guard';

export const routes: Routes = [
  { path: 'lifestyle-Preference', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    canActivate: [lifeStylePreferenceGuard],
    title: 'Lifestyle Preference',
    loadComponent: () =>
      import('./pages/lifestyle-preference/lifestyle-preference.component').then(
        c => c.LifestylePreferenceComponent
      ),
  },
  {
    path: 'complete',
    title: 'Lifestyle Preference',
    loadComponent: () =>
      import('./pages/lifestyle-preference-complete/lifestyle-preference-complete.component').then(
        c => c.LifestylePreferenceCompleteComponent
      ),
  },
];
