import { Store } from '@ngxs/store';
import { appSettings } from '@app/config';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { IAuthParam } from '@app/shared/models/auth';
import { fadeAnimation } from '@app/shared/animations';
import { CommonService, EncryptionService, HelperFunctionService } from '@app/core/services';
import { Router, ActivatedRoute } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { AuthHeaderComponent } from '@app/core/layouts/auth';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthenticationService } from '@app/core/authentication';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { filter, Observable, of, Subscription, switchMap, take, tap } from 'rxjs';
import {
  GetRegQuestions,
  PatchProfileDetails,
  RegistrationState,
  SendOtp,
  ViewProfile,
} from '@app/store';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CustomToastComponent } from '@app/shared/components';
import { HttpService } from '@app/core/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    AuthHeaderComponent,
    MatDatepickerModule,
    TranslatePipe,
    CustomToastComponent,
  ],
  animations: [fadeAnimation],
  styleUrl: './login.component.scss',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy {
  public submitted = false;
  public show_type = false;
  public isDisabled = false;
  private _store = inject(Store);
  public loginForm!: FormGroup;
  private subscriptions: Subscription[] = [];
  private _formBuilder = inject(FormBuilder);
  private rememberMe = appSettings.rememberKey;
  public apiSuccessMsg$ = this._store.select(RegistrationState.apiSuccessMsg);
  private profileDetails$: Observable<IViewProfile | null> = this._store.select(
    RegistrationState.profileDetails
  );
  public profileDetails: IViewProfile | null = null;
  public showMessage: { type: string; message: string } | null = null;
  public remainingTime = 60;

  @ViewChildren(' emailInput, passwordInput') formFields!: QueryList<ElementRef>;

  constructor(
    private _router: Router,
    private _http: HttpService,
    private _cookieService: CookieService,
    private _encryptionService: EncryptionService,
    private _authService: AuthenticationService,
    private _translate: TranslateService,
    private _common: CommonService,
    private _toastr: ToastrService,
    private _helperFn: HelperFunctionService
  ) {}

  ngOnInit(): void {
    this._common.setMessage(null);
    this.initiateLoginFormForm();
    this.onRememberMe();
    this.subscriptions.push(
      this._common.apiMessage$.subscribe(data => {
        this.showMessage = data;
      })
    );
  }

  private initiateLoginFormForm(): void {
    this.loginForm = this._formBuilder.group({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(appSettings.emailPattern),
      ]),
      password: new FormControl('', [Validators.required]),
      rememberMe: new FormControl(false),
    });

    this.subscriptions.push(
      this.loginForm.controls['email'].valueChanges.subscribe(() => {
        if (this.showMessage && this.showMessage.message) {
          this._common.setMessage(null);
        }
      }),
      this.loginForm.controls['password'].valueChanges.subscribe(() => {
        if (this.showMessage && this.showMessage.message) {
          this._common.setMessage(null);
        }
      })
    );
  }
  focusFirstInvalidField() {
    for (const field of this.formFields.toArray()) {
      const controlName = field.nativeElement.getAttribute('formControlName');
      const control = this.loginForm.get(controlName);
      if (control && control.invalid) {
        field.nativeElement.focus();
        break;
      }
    }
  }

  /**
   * *Getting all form controls from login form
   */
  get formControl() {
    return this.loginForm.controls;
  }

  /**
   * *Checking if control has error
   *
   * @param field form control name
   * @returns boolean
   */
  public hasFormControlError(field: string): boolean {
    const control = this.loginForm.get(field) as FormControl;
    if (this.submitted && (control.errors || control.invalid)) {
      return true;
    }
    return false;
  }

  public showPassword(event: Event) {
    event.preventDefault();
    this.show_type = !this.show_type;
  }

  public loginSubmit(): boolean | void {
    if (!this.isDisabled) {
      this.submitted = true;
      const formValue = this.loginForm.getRawValue();
      //form is valid
      if (this.loginForm.valid) {
        this.isDisabled = true;
        const param = {
          email: formValue.email,
          password: formValue.password,
          login_type: 1,
          device_os_type: 3,
          social_id: '',
          social_token: '',
          social_type: '',
        } as IAuthParam;
        let sendOtpParam: ISendOtp | null = null;
        this.subscriptions.push(
          this._authService
            .authenticate(param, formValue.rememberMe ?? false, 'login')
            .pipe(
              tap(() => this._store.dispatch(new ViewProfile())), // just dispatch the action
              switchMap(() =>
                this.profileDetails$.pipe(
                  // wait for profile details
                  filter(profile => !!profile), // wait until it has a value
                  take(1) // only take the first value
                )
              ),
              switchMap(profile => {
                // Now call another API with the profile data
                this.profileDetails = profile;
                const data = profile;
                if (data.user_status === 2 && data.registration_status === 2) {
                  sendOtpParam = {
                    email: data.email,
                    otp_for: 1,
                    is_resend: 0,
                  };
                  return this._store.dispatch(new SendOtp(sendOtpParam));
                  //return this._http.post('user/sendOtp', sendOtpParam);
                } else {
                  this._router.navigate(['/']);
                  return of(null);
                }
              })
            )
            .subscribe({
              next: () => {
                this.submitted = false;
                this.isDisabled = false;
                if (
                  this.profileDetails?.user_status === 2 &&
                  this.profileDetails.registration_status === 2
                ) {
                  this._common.setMessage({
                    type: 'success',
                    message: 'REGISTRATION_PAGE.SENT_VERIFICATION_MESSAGE',
                  });
                }
                localStorage.setItem('otp_remaining_time', this.remainingTime.toString());
                this._router.navigate(['/verify-otp'], {
                  queryParams: {
                    enc: encodeURIComponent(
                      this._encryptionService.encryptUsingAES256({
                        otp_param: sendOtpParam,
                        otp_timer: true,
                      })
                    ),
                  },
                });
              },
              error: apiError => {
                this.submitted = false;
                this.isDisabled = false;
                if (apiError.error.response.status.msg === 'Invalid_username_password') {
                  this._common.setMessage({
                    type: 'error',
                    message: 'FOR_REG_AND_LOGIN_ERROR.INVALID_USERNAME',
                  });
                } else if (apiError.error.response.status.msg === 'Otp_quota_exceeded') {
                  this._common.setMessage({
                    type: 'error',
                    message: 'FOR_REG_AND_LOGIN_ERROR.OTP_QUOTA_EXCEED',
                  });
                  this._authService.logout();
                  this._router.navigate(['/login']);
                } else if (
                  apiError.error.response.status.msg ===
                  'Something went wrong, please try again later.'
                ) {
                  this._common.setMessage({
                    type: 'error',
                    message: 'FOR_REG_AND_LOGIN_ERROR.SOMETHING_WENT_WRONG',
                  });
                } else {
                  this._toastr.error(apiError.error.response.status.msg, 'Error', {
                    closeButton: true,
                    timeOut: 3000,
                  });
                }
              },
            })
        );
      } else {
        setTimeout(() => {
          this.focusFirstInvalidField();
        }, 100);
        this._helperFn.scrollToInvalidElement();
      }
    }
  }

  /**
   * *If user checked Remember Me
   */
  private onRememberMe() {
    let rememberMeData!: IAuthParam;
    const storedData: string = this._cookieService.get(this.rememberMe);

    if (storedData) {
      rememberMeData = this._encryptionService.decryptUsingAES256(storedData);
      //Setting values to login form
      if (rememberMeData) {
        this.loginForm.patchValue({
          email: rememberMeData.email,
          password: rememberMeData.password,
          rememberMe: true,
        });
      }
    }
  }

  public redirectToSignUp() {
    this.subscriptions.push(
      this._store.dispatch(new GetRegQuestions({ questionnaire_type_id: 1 })).subscribe({
        next: () => {
          this._router.navigate(['/reg-question']);
        },
      })
    );
  }

  /**
   * *Unsubscribing observable on destroy
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
