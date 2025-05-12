import { Store } from '@ngxs/store';
import { appSettings, countrySettings, CustomDateAdapter, MY_DATE_FORMATS } from '@app/config';
import { ToastrService } from 'ngx-toastr';
import { CommonService, EncryptionService, HelperFunctionService } from '@app/core/services';
import { fadeAnimation } from '@app/shared/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { Router, ActivatedRoute } from '@angular/router';
import { IUserRegistration } from '@app/shared/models/auth';
import { AuthHeaderComponent } from '@app/core/layouts/auth';
import { AuthenticationService } from '@app/core/authentication';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import {
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  signal,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
  provideMomentDateAdapter,
} from '@angular/material-moment-adapter';
import {
  FormGroup,
  Validators,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CustomToastComponent } from '@app/shared/components';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { filter, Observable, of, Subscription, switchMap, take, tap } from 'rxjs';
import { GetRegQuestions, RegistrationState, SendOtp, ViewProfile } from '@app/store';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { passwordPattern } from '@app/shared/validators/passwordPattern.validators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { HttpService } from '@app/core/http';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TranslatePipe,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    AuthHeaderComponent,
    MatAutocompleteModule,
    CustomToastComponent,
    MatMenuModule,
    MatSelectModule,
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
  providers: [
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    // provideMomentDateAdapter(appSettings.customDateFormate),
    // provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  animations: [fadeAnimation],
})
export class RegistrationComponent implements OnInit, OnDestroy {
  public otp!: number;
  public submitted = false;
  public show_type = false;
  public isDisabled = false;
  public socialType!: string;
  public today = new Date();
  public years = this.today.getFullYear() - 18;
  public prevHundredYears = this.today.getFullYear() - 70;
  public month = this.today.getMonth() + 1;
  public date = this.today.getDate();
  public maxDate = new Date(`${this.month}-${this.date}-${this.years}`);
  public minDate = new Date(`${this.month}-${this.date}-${this.prevHundredYears}`);
  private _store = inject(Store);
  public passwordContainErrors = false;
  public language: string = 'english';
  public signUpWithEmailForm!: FormGroup;
  private subscriptions: Subscription[] = [];
  private _formBuilder = inject(FormBuilder);
  public flagImage: string | undefined;
  private answer!: {
    op_id: number | string;
    age_from: number;
    age_to: number;
    gender: string;
  };
  private profileDetails$: Observable<IViewProfile | null> = this._store.select(
    RegistrationState.profileDetails
  );
  public remainingTime = 60;
  public errorArray: string[] = [];
  public activeTab = 'tab1';

  dialogRef!: MatDialogRef<string, TemplateRef<Element>>;
  public showMessage: { type: string; message: string } | null = null;
  public selectCountryType: ILanguageText | null = null;
  public filteredCountryType!: ILanguageText[] | undefined;
  public countryControl = new FormControl<string | ILanguageText>('');
  public allCountryType: ILanguageText[] = countrySettings.allCountryDropdown;
  @ViewChild('termsConditionDialog') termsCondition = {} as TemplateRef<string>;
  @ViewChildren('userFirstNameInput, emailInput, passwordInput, dobInput, country, zipcodeInput')
  formFields!: QueryList<ElementRef>;
  @ViewChild(MatAutocompleteTrigger) countryTrigger!: MatAutocompleteTrigger;
  @ViewChild('userFirstNameInput') userFirstNameInputRef!: ElementRef;
  // @ViewChildren('fieldRef', { read: ElementRef }) formFields!: QueryList<ElementRef>;
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);

  constructor(
    private _router: Router,
    public _dialog: MatDialog,
    private _http: HttpService,
    private _datePipe: DatePipe,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _commonService: CommonService,
    private _authService: AuthenticationService,
    private _encryptionService: EncryptionService,
    private _translate: TranslateService,
    private _helperFn: HelperFunctionService
  ) {}
  ngOnInit(): void {
    this.language = this._translate.currentLang === 'zh' ? 'chinese' : 'english';
    this._locale.set(this._translate.currentLang);
    this._adapter.setLocale(this._locale());
    this.subscriptions.push(
      this._translate.onLangChange.subscribe(event => {
        this.initEmailForm();
        this._locale.set(this._translate.currentLang);
        this._adapter.setLocale(this._locale());
        this.countryControl.setValue('');
        this.language = event.lang === 'zh' ? 'chinese' : 'english';
        this.flagImage = '';
      }),
      this._commonService.apiMessage$.subscribe(data => {
        this.showMessage = data;
      })
    );
    //this.getProfileDetailsFromStore();
    this.initEmailForm();
    this.getQueryParams();
  }

  private getQueryParams() {
    this.subscriptions.push(
      this._route.queryParams.subscribe(param => {
        if (param['enc']) {
          const decryped = this._encryptionService.decryptUsingAES256(
            decodeURIComponent(param['enc'])
          );
          this.answer = decryped.answer;

          if (decryped.social_type) {
            this.socialType = decryped.social_type;
            if (this.socialType === 'registration') {
              this.initEmailForm();
              this.submitted = false;
              this._commonService.setMessage(null);
              this.countryControl.setValue('');
            }
          } else {
            this._router.navigate(['/']);
          }
        } else {
          this._router.navigate(['/']);
        }
      })
    );
  }

  public redirectToLogin() {
    if (this.showMessage && this.showMessage.message) {
      this._commonService.setMessage(null);
    }
    this._router.navigate(['/login']);
  }

  private initEmailForm(): void {
    this.signUpWithEmailForm = this._formBuilder.group({
      user_first_name: new FormControl('', [Validators.required, Validators.maxLength(255)]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(appSettings.emailPattern),
      ]),
      dob: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, passwordPattern.passwordValidation()]),
      zipcode: new FormControl('', [Validators.maxLength(20)]),
      isCheck: new FormControl(false),
    });

    this.subscriptions.push(
      this.signUpWithEmailForm.valueChanges.subscribe(() => {
        if (this.showMessage && this.showMessage.message) {
          this._commonService.setMessage(null);
        }
      })
    );
  }

  get formControl() {
    return this.signUpWithEmailForm.controls;
  }

  public hasFormControlError(field: string): boolean {
    const control = this.signUpWithEmailForm.get(field) as FormControl;
    if (this.submitted && (control.errors || control.invalid)) {
      return true;
    }
    return false;
  }

  showPassword(event: Event) {
    event.preventDefault();
    this.show_type = !this.show_type;
  }

  signInWithEmail() {
    this._router.navigate(['/registration'], {
      queryParams: {
        enc: encodeURIComponent(
          this._encryptionService.encryptUsingAES256({
            social_type: 'emailLogin',
            answer: { ...this.answer },
          })
        ),
      },
      queryParamsHandling: 'merge',
    });
    this.socialType = 'emailLogin';
  }

  backToRegistration() {
    this.initEmailForm();
    this.flagImage = '';
    this._commonService.setMessage(null);
    this._router.navigate(['/registration'], {
      queryParams: {
        enc: encodeURIComponent(
          this._encryptionService.encryptUsingAES256({
            social_type: 'registration',
            answer: { ...this.answer },
          })
        ),
      },
      queryParamsHandling: 'merge',
    });
    this.socialType = 'registration';
  }

  public goToRegQuestion() {
    this.subscriptions.push(
      this._store.dispatch(new GetRegQuestions({ questionnaire_type_id: 1 })).subscribe({
        next: () => {
          this._router.navigate(['/reg-question']);
        },
      })
    );
  }

  public registrationSubmit(): boolean | void {
    if (!this.isDisabled) {
      this.submitted = true;
      const formValue = this.signUpWithEmailForm.getRawValue();
      //form is valid
      if (this.signUpWithEmailForm.valid && formValue.isCheck) {
        this.isDisabled = true;
        const param = {
          user_first_name: formValue.user_first_name,
          email: formValue.email,
          user_type: 2,
          password: formValue.password, // NOT MANDATORY FOR SOCIAL REGISTRATION
          gender: this.answer.gender === 'man' ? 1 : this.answer.gender === 'woman' ? 2 : 0,
          country: formValue.country,
          zipcode: formValue.zipcode,
          dob: this._datePipe.transform(formValue.dob, 'yyyy-MM-dd') ?? '',
          is_social_reg: 0,
          social_id: '',
          social_token: '',
          social_type: '', // 1=>Gmail, 2=>Apple, 3=>Facebook
          is_verified: 0,
          device_os_type: 1,
          app_version: '',
          device_uid: '',
          device_token: '',
          device_name: '',
          device_model: '',
          device_version: '',
          browser_id: '',
          browser_version: '',
          session_id: '',
          browser_name: '',
          answers_data: [
            {
              questionnaire_id: 1,
              answers: [
                {
                  q_id: 1,
                  sel_opt_id: [this.answer.op_id],
                  sel_opt_text: '',
                },
                {
                  q_id: 2,
                  sel_opt_id: [this.answer.age_from, this.answer.age_to],
                  sel_opt_text: '',
                },
              ],
            },
          ],
        } as IUserRegistration;
        let sendOtpParam: ISendOtp | null = null;
        this.subscriptions.push(
          this._authService
            .authenticate(param, formValue.rememberMe ?? false, 'registration')
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
                const data = profile;
                if (data.user_status === 2) {
                  sendOtpParam = {
                    email: data.email,
                    otp_for: 1,
                    is_resend: 0,
                  };
                  return this._store.dispatch(new SendOtp(sendOtpParam));
                  // return this._http.post('user/sendOtp', sendOtpParam);
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
                if (this.showMessage && this.showMessage.message) {
                  this._commonService.setMessage(null);
                }
                this._commonService.setMessage({
                  type: 'success',
                  message: 'REGISTRATION_PAGE.SENT_VERIFICATION_MESSAGE',
                });
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
                const error = this._translate.instant('COMMON.ERROR');
                if (apiError.error.response.status.msg === 'Email_exists') {
                  this._commonService.setMessage({
                    type: 'error',
                    message: 'FOR_REG_AND_LOGIN_ERROR.ALREADY_EXIST_EMAIL',
                  });
                } else if (
                  apiError.error.response.status.msg ===
                  'Something went wrong, please try again later.'
                ) {
                  this._commonService.setMessage({
                    type: 'error',
                    message: 'FOR_REG_AND_LOGIN_ERROR.SOMETHING_WENT_WRONG',
                  });
                } else {
                  this._toastr.error(apiError.error.response.status.msg, 'Error', {
                    closeButton: true,
                    timeOut: 3000,
                  });
                }
                // const topBlock = document.querySelector('.login-page-wrapper') as HTMLElement;
                // if (this.showMessage && this.showMessage.message) {
                //   this._helperFn.scrollToInvalidElement(topBlock, 1500);
                // }
                const topBlock = document.querySelector('.header-content-block') as HTMLElement;
                if (this.showMessage && this.showMessage.message && topBlock) {
                  this._helperFn.smoothScrollToElement(topBlock, 1500);
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

  focusFirstInvalidField() {
    for (const field of this.formFields.toArray()) {
      const controlName = field.nativeElement.getAttribute('formControlName');
      const control = this.signUpWithEmailForm.get(controlName);
      if (control) {
        if (control && control.invalid) {
          field.nativeElement.focus();
          break;
        }
      } else {
        if (this.signUpWithEmailForm.controls['country'].invalid) {
          field.nativeElement.focus();
        }
      }
    }
  }

  private _filteredCountryType(value: string): ILanguageText[] {
    const filterValue = value.toLowerCase();
    const filterData = this.allCountryType.filter(option =>
      this.language === 'chinese'
        ? option.zh.toLowerCase().includes(filterValue)
        : option.en.toLowerCase().includes(filterValue)
    );
    return filterData.length
      ? filterData
      : this.language === 'chinese'
        ? [{ zh: '没有找到记录' } as ILanguageText]
        : [{ en: 'No record found' } as ILanguageText];
  }

  public showCountryType(countryType: ILanguageText): string {
    return countryType.en;
  }

  public showFilteredCountryType(is_focus: boolean) {
    const value = this.countryControl.value;
    this.subscriptions.push(
      this.countryControl.valueChanges.subscribe(() => {
        this.flagImage = '';
      })
    );
    if (value !== null) {
      const name =
        typeof value === 'string' ? value : this.language === 'chinese' ? value.zh : value.en;
      this.filteredCountryType =
        name && !is_focus ? this._filteredCountryType(name as string) : this.allCountryType.slice();
    }
  }

  public onCloseCountryType() {
    const index = this.allCountryType.findIndex(item =>
      this.language === 'chinese'
        ? item.zh ===
          (typeof this.countryControl.value === 'string'
            ? this.countryControl.value
            : this.countryControl.value?.zh)
        : item.en ===
          (typeof this.countryControl.value === 'string'
            ? this.countryControl.value
            : this.countryControl.value?.en)
    );
    if (index === -1) {
      this.countryControl.setValue('');
      this.signUpWithEmailForm.controls['country'].setValue('');
    } else {
      const country =
        this.language === 'chinese' ? this.allCountryType[index].zh : this.allCountryType[index].en;
      this.flagImage = this.allCountryType[index].flag;
      this.signUpWithEmailForm.controls['country'].setValue(country);
    }
  }

  public resetCountry() {
    this.flagImage = '';
    this.countryControl.setValue('');
    this.signUpWithEmailForm.controls['country'].setValue('');
  }

  get passwordValidationCheck() {
    return (
      this.formControl['password'].errors?.['upperCase'] ||
      this.formControl['password'].errors?.['lowerCase'] ||
      this.formControl['password'].errors?.['specialCharacter'] ||
      this.formControl['password'].errors?.['number'] ||
      this.formControl['password'].errors?.['length']
    );
  }

  /* Terms condition and privacy policy dialog open */
  openTermsPrivacyDialog(type: string) {
    this.activeTab = type;
    this.dialogRef = this._dialog.open(this.termsCondition, {
      panelClass: 'custom-termscondition-dialog',
      backdropClass: 'customTermsDialogBackdrop',
      hasBackdrop: true,
    });
  }

  /* Terms condition and privacy policy dialog close */
  closeTermsPolicyDialog(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
