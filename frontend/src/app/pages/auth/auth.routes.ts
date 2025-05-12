import { Routes } from '@angular/router';
import { introductionGuard } from '@app/core/guards';
import { communicationInteractionGuard } from '@app/core/guards/communication-interaction.guard';
import { datePreferenceGuard } from '@app/core/guards/date-preference.guard';
import { futureAspirationGuard } from '@app/core/guards/future-aspiration.guard';
import { lifeStylePreferenceGuard } from '@app/core/guards/lifestyle-Preference.guard';
import { logInGuard } from '@app/core/guards/login.guard';
import { otpGuard } from '@app/core/guards/otp.guards';
import { partnerPreferenceGuard } from '@app/core/guards/partner-preference.guard';
import { personalityInterestGuard } from '@app/core/guards/personality-interests.guard';
import { profileBasicsGuard } from '@app/core/guards/profile-basics.guard';
import { registrationGuard } from '@app/core/guards/registration.guard';
import { relationshipPreferenceGuard } from '@app/core/guards/relationship-preference.guard';
import { valueAndBeliefsGuard } from '@app/core/guards/values-and-beliefs.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [logInGuard],
    title: 'Sign In',
    loadComponent: () => import('./pages').then(c => c.LoginComponent),
  },
  {
    path: 'registration',
    canActivate: [registrationGuard],
    title: 'Registration',
    loadComponent: () => import('./pages').then(c => c.RegistrationComponent),
  },
  {
    path: 'reg-question',
    canActivate: [registrationGuard],
    title: 'Registration',
    loadComponent: () => import('./pages').then(c => c.RegistrationQuestionsComponent),
  },
  {
    path: 'verify-otp',
    canActivate: [otpGuard],
    title: 'Verify Otp',
    loadComponent: () => import('./pages').then(c => c.VerifyOtpComponent),
  },
  {
    path: 'image-upload',
    title: 'Profile images',
    loadChildren: () => import('./pages/image-upload/image-upload.routes').then(r => r.routes),
  },
  {
    path: 'partner-preference',
    canActivate: [partnerPreferenceGuard],
    title: 'Partner Preference',
    loadChildren: () =>
      import('./pages/partner-preference/partner-preference.routs').then(r => r.routes),
  },
  {
    path: 'lifestyle-Preference',
    canActivate: [lifeStylePreferenceGuard],
    title: 'Lifestyle Preference',
    loadChildren: () =>
      import('./pages/lifestyle-preference/lifestyle-preference.routes').then(r => r.routes),
  },
  {
    path: 'personality-interests',
    canActivate: [personalityInterestGuard],
    title: 'Personality and Interests',
    loadChildren: () =>
      import('./pages/personality-interest/personality-interest.routes').then(r => r.routes),
  },
  {
    path: 'reg-success',
    title: 'Thank You',
    loadChildren: () =>
      import('./pages/registration-success/registration-success.routes').then(r => r.routes),
  },
  {
    path: 'profile-basics',
    canActivate: [profileBasicsGuard],
    title: 'Profile Basics',
    loadChildren: () => import('./pages/profile-basics/profile-basics.route').then(r => r.routes),
  },
  {
    path: 'relationship-preference',
    canActivate: [relationshipPreferenceGuard],
    title: 'Relationship Preference',
    loadChildren: () =>
      import('./pages/relationship-preference/relationship-preference.route').then(r => r.routes),
  },
  {
    path: 'values-and-beliefs',
    canActivate: [valueAndBeliefsGuard],
    title: 'Values and Beliefs',
    loadChildren: () =>
      import('./pages/values-and-beliefs/value-and-beliefs.routs').then(r => r.routes),
  },
  {
    path: 'future-aspiration',
    canActivate: [futureAspirationGuard],
    title: 'Future Aspiration',
    loadChildren: () =>
      import('./pages/future-aspiration/future-aspiration.routes').then(r => r.routes),
  },
  {
    path: 'date-preference',
    canActivate: [datePreferenceGuard],
    title: 'Date Preference',
    loadChildren: () => import('./pages/date-preference/date-preference.route').then(r => r.routes),
  },
  {
    path: 'communication-interaction',
    canActivate: [communicationInteractionGuard],
    title: 'Communication Interaction',
    loadChildren: () =>
      import('./pages/communication-interaction/communication-interaction.route').then(
        r => r.routes
      ),
  },
  {
    path: 'introduction',
    title: 'Introduction',
    loadChildren: () => import('./pages/introduction/introduction.routes').then(r => r.routes),
  },
];
