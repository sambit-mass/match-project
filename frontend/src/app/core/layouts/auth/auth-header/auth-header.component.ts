import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { ClearImage, GetRegQuestions, PatchProfileDetails, RegistrationState } from '@app/store';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { CookieService } from 'ngx-cookie-service';
import { appSettings } from '@app/config';
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthenticationService } from '@app/core/authentication';
import { InitialNamePipe } from '@app/shared/pipes';
import { CommonService } from '@app/core/services';

@Component({
  selector: 'app-auth-header',
  standalone: true,
  imports: [
    MatSelectModule,
    MatFormFieldModule,
    CommonModule,
    MatMenuModule,
    TranslatePipe,
    InitialNamePipe,
  ],
  templateUrl: './auth-header.component.html',
  styleUrl: './auth-header.component.scss',
})
export class AuthHeaderComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  @Input('showSignIn') isShowSignIn: boolean = false;
  @Input('showSignUp') isShowSignUp: boolean = false;
  @Input('showProfile') isShowProfile: boolean = true;
  private _store = inject(Store);
  private default_language_key: string = appSettings.default_language;
  public selectedLanguage = '';
  public profileData: IViewProfile | null = null;
  private profileDetails$: Observable<IViewProfile | null> = this._store.select(
    RegistrationState.profileDetails
  );
  public langageList = [
    { name: 'English', value: 'en' },
    { name: 'Chinese', value: 'zh' },
  ];
  public isLoggedIn = false;

  constructor(
    private _router: Router,
    private _translate: TranslateService,
    private _cookieService: CookieService,
    private _authService: AuthenticationService,
    private _commonService: CommonService
  ) {
    this.selectedLanguage = this._cookieService.get(this.default_language_key) as string;
  }

  ngOnInit(): void {
    if (this._authService.isAuthenticated()) {
      this.isLoggedIn = true;
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

  rootRedirection() {
    if (!this.isLoggedIn) {
      this._router.navigate(['/']);
    }
  }

  onSignUp() {
    this.subscriptions.push(
      this._store.dispatch(new GetRegQuestions({ questionnaire_type_id: 1 })).subscribe({
        next: () => {
          this._router.navigate(['/reg-question']);
        },
      })
    );
  }

  /**
   * Log Out
   */
  onLogout(event: Event) {
    event.preventDefault();
    this._commonService.setMessage(null);
    this._authService.logout();
    this._router.navigate(['/login']).then(() => {
      this._store.dispatch(new ClearImage(null));
      this._store.dispatch(new PatchProfileDetails(null));
    });
  }

  onSignIn() {
    this._router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(all => all.unsubscribe());
  }
}
