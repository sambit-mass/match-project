import { Routes } from '@angular/router';
import { relationshipPreferenceGuard } from '@app/core/guards/relationship-preference.guard';

export const routes: Routes = [
  { path: 'relationship-preference', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    canActivate: [relationshipPreferenceGuard],
    title: 'Relationship Preference',
    loadComponent: () =>
      import('./pages/relationship-preference/relationship-preference.component').then(
        c => c.RelationshipPreferenceComponent
      ),
  },
  {
    path: 'complete',
    title: 'Relationship Preference',
    loadComponent: () =>
      import(
        './pages/relationship-preference-complete/relationship-preference-complete.component'
      ).then(c => c.RelationshipPreferenceCompleteComponent),
  },
];
