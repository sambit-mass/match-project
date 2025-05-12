import { Routes } from '@angular/router';
import { communicationInteractionGuard } from '@app/core/guards/communication-interaction.guard';

export const routes: Routes = [
  { path: 'communication-interaction', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    canActivate: [communicationInteractionGuard],
    title: 'Communication Interaction',
    loadComponent: () =>
      import('./pages/communication-interaction/communication-interaction.component').then(
        c => c.CommunicationInteractionComponent
      ),
  },
  {
    path: 'complete',
    title: 'Communication Interaction',
    loadComponent: () =>
      import(
        './pages/communication-interaction-complete/communication-interaction-complete.component'
      ).then(c => c.CommunicationInteractionCompleteComponent),
  },
];
