import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { appSettings } from '@app/config';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { InitialNamePipe } from '@app/shared/pipes';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { ProfileState } from '@app/store/states/profile.state';
import { ViewProfile } from '@app/store/actions/profile.action';
import { AuthenticationService } from '@app/core/authentication';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { ClearImage, PatchProfileDetails, RegistrationState } from '@app/store';
import { CommonService } from '@app/core/services';

@Component({
  selector: 'app-web-header',
  standalone: true,
  imports: [MatMenuModule, MatSelectModule, MatFormFieldModule, InitialNamePipe, TranslatePipe],
  templateUrl: './web-header.component.html',
  styleUrl: './web-header.component.scss',
})
export class WebHeaderComponent implements OnInit, OnDestroy {
  public _store = inject(Store);
  public selectedLanguage = '';
  public subscriptions: Subscription[] = [];
  public viewProfile: IViewProfile | null = null;
  private credentials: string = appSettings.credentialsKey;
  public viewProfile$ = this._store.select(ProfileState.viewProfile);
  private default_language_key: string = appSettings.default_language;
  public languageSelecter: ILanguageSelection[] = [
    {
      id: 1,
      value: 'en',
      name: { en: 'English', zh: '英语' },
    },
    {
      id: 2,
      value: 'zh',
      name: { en: 'Chinese', zh: '中国人' },
    },
  ];
  public profileData: IViewProfile | null = null;
  private profileDetails$: Observable<IViewProfile | null> = this._store.select(
    RegistrationState.profileDetails
  );

  constructor(
    private _router: Router,
    private _toastr: ToastrService,
    private _translate: TranslateService,
    private _cookieService: CookieService,
    private _authService: AuthenticationService,
    private _commonService: CommonService
  ) {
    this.selectedLanguage = this._cookieService.get(this.default_language_key) as string;
  }

  ngOnInit(): void {
    if (this._authService.isAuthenticated()) {
      this.subscriptions.push(
        this.profileDetails$.subscribe({
          next: details => {
            if (details) {
              this.profileData = details;
            }
          },
        })
      );
    }
  }

  onLanguageChange(event: MatSelectChange) {
    const selectedValue = event.value; // 'en' or 'zh'
    /* Use language code */
    this._translate.use(selectedValue);
    /* set updated language code */
    this._cookieService.set(this.default_language_key, selectedValue, {
      path: '/',
    });
    // this._commonService.setLanguage(selectedValue);
  }

  onLogout(event: Event) {
    event.preventDefault();
    this._commonService.setMessage(null);
    this._authService.logout();
    this._router.navigate(['/login']).then(() => {
      this._store.dispatch(new ClearImage(null));
      this._store.dispatch(new PatchProfileDetails(null));
      this._commonService.setShowCategorySubmenu(false);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
