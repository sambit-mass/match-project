import { Routes } from '@angular/router';
import { datePreferenceGuard } from '@app/core/guards/date-preference.guard';

export const routes: Routes = [
  { path: 'date-preference', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    canActivate: [datePreferenceGuard],
    title: 'Date Preference',
    loadComponent: () =>
      import('./pages/date-preference/date-preference.component').then(
        c => c.DatePreferenceComponent
      ),
  },
  {
    path: 'complete',
    title: 'Date Preference',
    loadComponent: () =>
      import('./pages/date-preference-complete/date-preference-complete.component').then(
        c => c.DatePreferenceCompleteComponent
      ),
  },
];
