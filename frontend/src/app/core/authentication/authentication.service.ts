import { of } from 'rxjs';
import { HttpService } from '@core/http';
import { appSettings } from '@app/config';
import { inject, Injectable } from '@angular/core';
import { browserInfo } from '@shared/utilities';
import { EncryptionService } from '../services';
import { Observable, mergeMap, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../services/common.service';
import { IAuthCodeInfo, IAuthParam, ITokenInfo, IUserRegistration } from '@app/shared/models/auth';
import { Store } from '@ngxs/store';
import { PatchProfileDetails } from '@app/store/actions/registration.action';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private credentials: string = appSettings.credentialsKey;
  private default_language_key: string = appSettings.default_language;
  public selected_language: string = '';
  public _store = inject(Store);

  constructor(
    private _http: HttpService,
    private _commonService: CommonService,
    private _cookieService: CookieService,
    private _encryptionService: EncryptionService
  ) {}

  public authenticate(data: IUserRegistration | IAuthParam, remember_me: boolean, type: string) {
    let url = '';
    if (type === 'login') {
      url = 'user/login';
    } else {
      url = 'user/registration';
    }
    const loginParam: IUserRegistration | IAuthParam = {
      ...data,
      session_id: browserInfo().session_id,
      browser_id: browserInfo().browser_id,
      browser_name: browserInfo().browser_name,
      browser_version: browserInfo().browser_version,
    };

    return this._http.post(url, loginParam).pipe(
      mergeMap(result1 => {
        const authCodeObj = result1.response.data as IAuthCodeInfo;
        return this._http
          .post('user/generateToken', {
            authorization_code: authCodeObj.authorization_code,
          })
          .pipe(
            tap(result => {
              const authResponse: ITokenInfo = {
                ...result.response.data,
                enc_username: this._encryptionService.encryptUsingAES256(
                  result.response.data.user_email
                ),
              };
              this._commonService.setProfile(authResponse);
              const language = this._cookieService.get(this.default_language_key) as string;
              this.selected_language = language;
              this._cookieService.deleteAll();
              this._cookieService.set(this.default_language_key, language);

              // set cookie for remember me
              if (remember_me) {
                const remenberMe = {
                  email: data.email,
                  password: data.password,
                };
                this._cookieService.set(
                  appSettings.rememberKey,
                  this._encryptionService.encryptUsingAES256(remenberMe),
                  {
                    path: '/',
                  }
                );
              }
              authResponse.profile_image = '';
              // set cookie for tokens
              this._cookieService.set(this.credentials, JSON.stringify({ ...authResponse }), {
                path: '/',
              });
              // take token backup
              this._commonService.saveTokenInfo(JSON.stringify(authResponse));

              return authResponse;
            })
          );
      })
    );
  }

  /**
   * *getting user from storage
   *
   * @returns current user's data
   */
  public getUser(): ITokenInfo {
    const user = this._cookieService.get(this.credentials) as string;

    const savedCredentials: ITokenInfo = user ? JSON.parse(user) : null;
    // take token backup
    if (user) this._commonService.saveTokenInfo(user);
    return savedCredentials;
  }

  /**
   * *Returning current user detail from storage
   *
   * @returns observable of current user
   * @developer
   */
  public getUserInfo(): Observable<ITokenInfo> {
    const savedCredentials: ITokenInfo = this.getUser();
    return of(savedCredentials);
  }

  /**
   * *Getting current user token from cookie
   *
   * @returns JWT Token
   */
  public getToken(): string {
    const savedCredentials = this.getUser();
    return savedCredentials && savedCredentials.access_token ? savedCredentials.access_token : '';
  }

  /**
   * *Getting current user type from cookie
   *
   * @returns User Type
   */
  public getUserType(): string {
    const userInfo: ITokenInfo = this.getUser();
    return userInfo && userInfo.user_type ? userInfo.user_type : '';
  }

  /**
   * *Sign outs user
   * *Removes details from the token storage
   *
   * @returns observable of boolean
   */
  public logout() {
    this._store.dispatch(new PatchProfileDetails(null));
    this._cookieService.delete(this.credentials);
    this._cookieService.delete(this.credentials, '/');
  }

  /**
   * *If user is authenticated
   *
   * @returns boolean if authenticated
   */
  public isAuthenticated() {
    if (this._cookieService.get(this.credentials)) {
      return true;
    }
    return false;
  }

  /**
   * *Generate new token
   *
   * @returns refresh token
   */
  public getRefreshToken() {
    const userInfo = this.getUser();
    const param = {
      refresh_token: userInfo.refresh_token,
    };
    return this._http.post('user/regenerateToken', param);
  }

  /**
   * *Updating new tokens in cookie
   *
   * @param authData refresh auth result
   */
  public updateRefreshedToken(authData: ITokenInfo): void {
    const savedCredentials: ITokenInfo = this.getUser();
    const updated = {
      ...savedCredentials,
      ...authData,
    };
    this._cookieService.set(this.credentials, JSON.stringify(updated), {
      path: '/',
    });
    // take token backup
    this._commonService.saveTokenInfo(JSON.stringify(updated));
  }
}
