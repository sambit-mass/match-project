import { Routes } from '@angular/router';
import { profileBasicsGuard } from '@app/core/guards/profile-basics.guard';

export const routes: Routes = [
  { path: 'profile-basics', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    canActivate: [profileBasicsGuard],
    title: 'Profile Basics',
    loadComponent: () =>
      import('./pages/profile-basics/profile-basics.component').then(c => c.ProfileBasicsComponent),
  },
  {
    path: 'complete',
    title: 'Profile Basics',
    loadComponent: () =>
      import('./pages/profile-basics-complete/profile-basics-complete.component').then(
        c => c.ProfileBasicsCompleteComponent
      ),
  },
];
