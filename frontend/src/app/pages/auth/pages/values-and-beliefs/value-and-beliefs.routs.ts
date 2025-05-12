import { Routes } from '@angular/router';
import { valueAndBeliefsGuard } from '@app/core/guards/values-and-beliefs.guard';

export const routes: Routes = [
  { path: 'values-and-beliefs', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    canActivate: [valueAndBeliefsGuard],
    title: 'Values and Beliefs',
    loadComponent: () =>
      import('./pages/values-and-beliefs/values-and-beliefs.component').then(
        c => c.ValuesAndBeliefsComponent
      ),
  },
  {
    path: 'complete',
    title: 'Values and Beliefs',
    loadComponent: () =>
      import('./pages/values-and-beliefs-complete/values-and-beliefs-complete.component').then(
        c => c.ValuesAndBeliefsCompleteComponent
      ),
  },
];
