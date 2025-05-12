import { inject } from '@angular/core';
import { HttpService } from '@core/http';
import { ToastrService } from 'ngx-toastr';
import { Router, ResolveFn } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { CommonService } from '@core/services/common.service';

export const viewPermissionResolverFn: ResolveFn<IMainMenu[] | null> = ():
  | Observable<IMainMenu[] | null>
  | Promise<IMainMenu[] | null>
  | IMainMenu[] => {
  const _router = inject(Router);
  const _toastr = inject(ToastrService);
  const _httpService = inject(HttpService);
  const _commonService = inject(CommonService);

  /**
   * Acl permission resolver
   * Call api for specific user type
   */
  return _httpService.post('acl/checkAllPermission', {}).pipe(
    map(apiResult => {
      const accessControl: IMainMenu[] = apiResult.response.data.rows;
      _commonService.setAccessControls(accessControl);
      return accessControl;
    }),
    catchError(apiError => {
      _router.navigate(['/forbidden']);
      _toastr.error(apiError.error.response.status.msg, 'error', {
        closeButton: true,
        timeOut: 3000,
      });
      return of(null);
    })
  );
};
