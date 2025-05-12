import { Store } from '@ngxs/store';
import { HttpService } from '../http';
import { inject } from '@angular/core';
import { map, mergeMap, Observable, of, take } from 'rxjs';
import { Router, UrlTree, CanActivateFn } from '@angular/router';
import { PatchProfileDetails, RegistrationState } from '@app/store';
import { AuthenticationService } from '../authentication/authentication.service';

export const relationshipPreferenceGuard: CanActivateFn = ():
  | boolean
  | UrlTree
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree> => {
  const _store = inject(Store);
  const _router = inject(Router);
  const _http = inject(HttpService);
  const _authService = inject(AuthenticationService);
  const isLoggedIn = _authService.isAuthenticated();
  const profileDetails$: Observable<IViewProfile | null> = _store.select(
    RegistrationState.profileDetails
  );

  return profileDetails$
    .pipe(
      take(1),
      mergeMap(_profile => {
        return (isLoggedIn && _profile == null ? _http.get('user/viewProfile') : of(_profile)).pipe(
          take(1),
          map(__profile => {
            if (isLoggedIn && _profile == null) {
              _store.dispatch(new PatchProfileDetails(__profile.response.data));
            }
            return isLoggedIn && _profile == null ? __profile.response.data : __profile;
          })
        );
      })
    )
    .pipe(
      take(1),
      map(profile => {
        /**
         * *Auth Guard to prevent unauthorized user
         */

        if (isLoggedIn && profile) {
          const userStatus = profile.user_status;
          const regStatus = profile.registration_status;
          const quesSubmitStatus = profile?.ques_submit_status;
          if (userStatus === 2 && regStatus === 4 && quesSubmitStatus === 5) {
            return true;
          } else {
            _router.navigate(['/']);
            return false;
          }
        }
        _router.navigate(['/']);
        return false;
      })
    );
};
