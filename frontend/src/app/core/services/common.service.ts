import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { ITokenInfo } from '@app/shared/models/auth';
export interface IUnsaveFormCheck {
  checkChanges: boolean;
  valueModified: boolean;
  submitForm: boolean;
}

@Injectable({ providedIn: 'root' })
export class CommonService {
  public aclBroadcastChannel: BroadcastChannel = new BroadcastChannel('aclChannel');

  /* Error interceptor properties */
  public isRefreshingToken = false;
  public tokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  /* Setting loader status */
  private _loaderSubject = new BehaviorSubject<boolean>(true);
  public loaderSource$ = this._loaderSubject.asObservable();

  public setLoadingStatus(type: boolean): void {
    this._loaderSubject.next(type);
  }

  /* token info backup for reuse token */
  private _tokenInfoSubject = new BehaviorSubject<string | null>(null);
  public tokenInfoSource$ = this._tokenInfoSubject.asObservable();

  public saveTokenInfo(type: string | null) {
    this._tokenInfoSubject.next(type);
  }

  /* Set access controls *ACL* */
  private accessControls = new BehaviorSubject<IMainMenu[] | null>(null);
  public accessControls$ = this.accessControls.asObservable();

  public setAccessControls(data: IMainMenu[], needBroadcast = true) {
    this.accessControls.next(data);
    if (needBroadcast) this.aclBroadcastChannel.postMessage(data);
  }

  /* update profile  */
  private update_profile = new BehaviorSubject<ITokenInfo | null>(null);
  public updateProfile$ = this.update_profile.asObservable();
  public setProfile(type: ITokenInfo | null) {
    this.update_profile.next(type);
  }

  /* update profile  */
  private messageSource = new BehaviorSubject<{ type: string; message: string } | null>(null); // or use Subject if no initial value
  apiMessage$ = this.messageSource.asObservable();
  setMessage(message: { type: string; message: string } | null) {
    this.messageSource.next(message);
  }

  /*Show Hide Category Sub Menu*/
  private show_category_submenu = new BehaviorSubject<boolean>(false);
  public showCategorySubmenu$ = this.show_category_submenu.asObservable();
  setShowCategorySubmenu(value: boolean): void {
    this.show_category_submenu.next(value);
  }
}
