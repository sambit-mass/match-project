import { Observable } from 'rxjs';
import { CanDeactivateFn, UrlTree } from '@angular/router';

type CanDeactivateType =
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree;

export interface CanComponentDeactivate {
  canDeactivate: () => CanDeactivateType;
}

export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component: CanComponentDeactivate
) => {
  /**
   * We have to implements CanComponentDeactivate to use canDeactivateGuard
   */
  return component.canDeactivate ? component.canDeactivate() : true;
};
