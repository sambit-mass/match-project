import { Routes } from '@angular/router';
import { imageUploadGuard } from '@app/core/guards/image-upload.guard';

export const routes: Routes = [
  { path: 'image-upload', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    canActivate: [imageUploadGuard],
    title: 'Images',
    loadComponent: () =>
      import('./pages/image-upload/image-upload.component').then(c => c.ImageUploadComponent),
  },
];
