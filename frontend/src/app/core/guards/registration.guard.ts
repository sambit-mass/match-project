import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { Router, UrlTree, CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

export const registrationGuard: CanActivateFn = ():
  | boolean
  | UrlTree
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree> => {
  const _router = inject(Router);
  const _authService = inject(AuthenticationService);
  /**
   * *Auth Guard to prevent unauthorized user
   */
  const isLoggedIn = _authService.isAuthenticated();
  if (isLoggedIn) {
    _router.navigate(['/']);
    return false;
  }
  return true;
};
