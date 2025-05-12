import { Routes } from '@angular/router';
import { partnerPreferenceGuard } from '@app/core/guards/partner-preference.guard';

export const routes: Routes = [
  { path: 'partner-preference', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    canActivate: [partnerPreferenceGuard],
    title: 'Partner Preference',
    loadComponent: () =>
      import('./pages/partner-preference/partner-preference.component').then(
        c => c.PartnerPreferenceComponent
      ),
  },
  {
    path: 'complete',
    title: 'Partner Preference',
    loadComponent: () =>
      import('./pages/partner-preference-complete/partner-preference-complete.component').then(
        c => c.PartnerPreferenceCompleteComponent
      ),
  },
];
