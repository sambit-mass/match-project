import { map, mergeMap, Observable, of, take } from 'rxjs';
import { inject } from '@angular/core';
import { Router, UrlTree, CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { PatchProfileDetails, RegistrationState } from '@app/store';
import { Store } from '@ngxs/store';
import { HttpService } from '../http';

export const webGuard: CanActivateFn = ():
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
          const quesSubmitStatus = profile.ques_submit_status;
          const regStatus = profile.registration_status;
          if (userStatus === 2) {
            switch (regStatus) {
              case 2: {
                _router.navigate(['/login']);
                break;
              }
              case 3: {
                _router.navigate(['/image-upload']);
                break;
              }
              case 4: {
                switch (quesSubmitStatus) {
                  case 0: {
                    _router.navigate(['/partner-preference']);
                    break;
                  }
                  case 1: {
                    _router.navigate(['/profile-basics']);
                    break;
                  }
                  case 2: {
                    _router.navigate(['/lifestyle-Preference']);
                    break;
                  }
                  case 3: {
                    _router.navigate(['/values-and-beliefs']);
                    break;
                  }
                  case 4: {
                    _router.navigate(['/personality-interests']);
                    break;
                  }
                  case 5: {
                    _router.navigate(['/relationship-preference']);
                    break;
                  }
                  case 6: {
                    _router.navigate(['/date-preference']);
                    break;
                  }
                  case 7: {
                    _router.navigate(['/communication-interaction']);
                    break;
                  }
                  case 8: {
                    _router.navigate(['/future-aspiration']);
                    break;
                  }
                  default: {
                    _router.navigate(['/']);
                  }
                }
                break;
              }
              case 5: {
                _router.navigate(['/introduction']);
                break;
              }
              case 6: {
                _router.navigate(['/reg-success']);
                break;
              }
              default: {
                _router.navigate(['/']);
              }
            }
          } else {
            _router.navigate(['/profile']);
          }
          return false;
        }
        return true;
      })
    );
};
