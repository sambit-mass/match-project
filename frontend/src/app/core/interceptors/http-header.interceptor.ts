import { inject } from '@angular/core';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';
import { HttpEvent, HttpRequest, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { endPointSettings } from '@app/config';

export const httpAuthHeaderInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const _loadingBar = inject(LoadingBarService);
  const _authService = inject(AuthenticationService);

  /* Adding Authorization token in header */
  const headersConfig: Record<string, string> = {};

  /* If token found setting it in header */
  const token: string = _authService.getToken();
  const skipLoadingBarUrls = endPointSettings.urls; // Add more if needed
  const isSkipLoading = skipLoadingBarUrls.some(url => req.url.includes(url));
  if (token) {
    headersConfig['Authorization'] = 'Bearer ' + token;
  }
  const HTTPRequest = req.clone({ setHeaders: headersConfig });
  if (!isSkipLoading) {
    _loadingBar.useRef().start();
  }
  return next(HTTPRequest).pipe(
    finalize(() => {
      if (!isSkipLoading) {
        _loadingBar.useRef().complete();
      }
    }),
    catchError((error: any) => {
      if (!isSkipLoading) {
        _loadingBar.useRef().complete();
      }
      return throwError(() => error);
    })
  );
};
