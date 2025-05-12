import { Routes } from '@angular/router';
import { personalityInterestGuard } from '@app/core/guards/personality-interests.guard';

export const routes: Routes = [
  { path: 'personality-interests', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    canActivate: [personalityInterestGuard],
    title: 'Personality and Interests',
    loadComponent: () =>
      import('./pages/personality-interest/personality-interest.component').then(
        c => c.PersonalityInterestComponent
      ),
  },
  {
    path: 'complete',
    title: 'Personality and Interests',
    loadComponent: () =>
      import('./pages/personality-interest-complete/personality-interest-complete.component').then(
        c => c.PersonalityInterestCompleteComponent
      ),
  },
];
