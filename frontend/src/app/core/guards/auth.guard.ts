import { map, mergeMap, Observable, of, take } from 'rxjs';
import { inject } from '@angular/core';
import { AuthenticationService } from '../authentication/authentication.service';
import {
  Router,
  UrlTree,
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { PatchProfileDetails, RegistrationState } from '@app/store';
import { Store } from '@ngxs/store';
import { HttpService } from '../http';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> => {
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
        if (isLoggedIn && profile && profile.user_status === 3) {
          // authorized so return true
          return true;
        } else {
          // not logged in so redirect to login page
          _router.navigate(['/']);
          return false;
        }
      })
    );
};
