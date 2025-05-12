import { Routes } from '@angular/router';
import { futureAspirationGuard } from '@app/core/guards/future-aspiration.guard';

export const routes: Routes = [
  { path: 'future-aspiration', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    canActivate: [futureAspirationGuard],
    title: 'Future Aspiration',
    loadComponent: () =>
      import('./pages/future-aspiration/future-aspiration.component').then(
        c => c.FutureAspirationComponent
      ),
  },
  {
    path: 'complete',
    title: 'Future Aspiration',
    loadComponent: () =>
      import('./pages/future-aspiration-complete/future-aspiration-complete.component').then(
        c => c.FutureAspirationCompleteComponent
      ),
  },
];
