import {
  Inject,
  inject,
  OnInit,
  OnDestroy,
  ViewChild,
  Component,
  TemplateRef,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subscription, take, timer } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { fadeAnimation } from '@app/shared/animations';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthHeaderComponent } from '@app/core/layouts/auth';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GetAllImages, SendOtp, VerifyOtp } from '@app/store';
import { CustomToastComponent } from '@app/shared/components';
import { CommonService, EncryptionService } from '@app/core/services';
import { AuthenticationService } from '@app/core/authentication';
import { NoSpecialCharactersDirective } from '@app/shared/directives';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TranslatePipe,
    MatInputModule,
    AuthHeaderComponent,
    CustomToastComponent,
    ReactiveFormsModule,
    NoSpecialCharactersDirective,
  ],
  animations: [fadeAnimation],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.scss',
})
export class VerifyOtpComponent implements OnInit, AfterViewInit, OnDestroy {
  public otp!: number;
  public submitted = false;
  public isDisabled = false;
  public sendOtpParam!: ISendOtp;
  public language: string = 'english';
  private _store = inject(Store);
  private subscriptions: Subscription[] = [];
  private dialog = inject(MatDialog);
  public warningDialogRef!: MatDialogRef<string, any>;
  @ViewChild('warningDialog') warningDialog!: TemplateRef<string>;
  public timer$!: Observable<number>; // Observable for the countdown timer
  public timerSubscription: Subscription | undefined; // Timer subscription
  public remainingTime: number = 0; // Time in seconds
  public message: string = ''; // Message to show (OTP expiration or success)
  public otp_timer: boolean = false;
  public showMessage: { type: string; message: string } | null = null;
  otpForm!: FormGroup;
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  @ViewChild('digit1') digit1Ref!: ElementRef;
  public isPaste: boolean = false;

  constructor(
    private _router: Router,
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _translate: TranslateService,
    private _commonService: CommonService,
    private _authService: AuthenticationService,
    @Inject(DOCUMENT) private document: Document,
    private _encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.getQueryParams();
    this.initOtpForm();
    const otpRemainingTime = localStorage.getItem('otp_remaining_time');
    if (otpRemainingTime) {
      this.remainingTime = Number(otpRemainingTime);
    }
    if (!otpRemainingTime || (otpRemainingTime && +otpRemainingTime > 0)) {
      this.startOtpTimer();
    }
    this.subscriptions.push(
      this._commonService.apiMessage$.subscribe(data => {
        this.showMessage = data;
      })
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.digit1Ref.nativeElement.focus();
    });
  }

  private getQueryParams() {
    this.subscriptions.push(
      this._route.queryParams.subscribe(param => {
        if (param['enc']) {
          const decryped = this._encryptionService.decryptUsingAES256(
            decodeURIComponent(param['enc'])
          );
          if (decryped.otp_param) {
            this.sendOtpParam = decryped.otp_param;
            this.otp_timer = decryped.otp_timer;
          } else {
            this._router.navigate(['/']);
          }
        } else {
          this._router.navigate(['/']);
        }
      })
    );
  }

  //Alert Dialog//
  public openWarningDialog(event: Event) {
    if (this.showMessage) {
      this._commonService.setMessage(null);
    }
    event.stopPropagation();
    this.warningDialogRef = this.dialog.open(this.warningDialog, {
      panelClass: 'warning-dialog',
      backdropClass: 'customDialogBackdrop',
      hasBackdrop: true,
      disableClose: true,
    });
  }

  public closeWarningDialog() {
    this.document.body.classList.remove('bespoke-scroll');
    this.warningDialogRef.close();
  }

  initOtpForm() {
    this.otpForm = this._fb.group({
      digit1: new FormControl('', [Validators.required]),
      digit2: new FormControl('', [Validators.required]),
      digit3: new FormControl('', [Validators.required]),
      digit4: new FormControl('', [Validators.required]),
      digit5: new FormControl('', [Validators.required]),
      digit6: new FormControl('', [Validators.required]),
    });
    Object.values(this.otpForm.controls).forEach(control => {
      this.subscriptions.push(
        control.valueChanges.subscribe(() => {
          if (this.showMessage && !this.isPaste) {
            this._commonService.setMessage(null);
          }
        })
      );
    });
  }

  public get formControl() {
    return this.otpForm.controls;
  }

  public hasFormControlError(field: string): boolean {
    const control = this.otpForm.get(field) as FormControl;
    if (this.submitted && (control.errors || control.invalid)) {
      return true;
    }
    return false;
  }

  moveToNext(
    fromText: HTMLInputElement | null,
    qurentText: HTMLInputElement,
    totext: HTMLInputElement | null,
    event: KeyboardEvent
  ) {
    const key = event.key; // const {key} = event; ES6+
    if (key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight') {
      if (key === 'ArrowRight') {
        if (totext) totext.focus();
      } else {
        if (fromText) fromText.focus();
      }
    } else {
      setTimeout(() => {
        let value = qurentText.value;
        // Keep only the first digit if multiple characters were typed
        if (value.length > 1) {
          value = value.charAt(0);
          qurentText.value = value;
        }
        const controlName = qurentText.getAttribute('formcontrolname');
        if (/^[0-9]$/.test(value)) {
          if (controlName) this.otpForm.controls[controlName].setValue(value);
          if (totext) {
            totext.focus();
          }
          if (this.otpForm.valid) {
            this.verifyOtp();
          }
        } else {
          if (controlName) this.otpForm.controls[controlName].setValue('');
        }
      });
    }
  }

  handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    this.isPaste = true;
    const pasteData = event.clipboardData?.getData('text').trim();

    if (pasteData && /^[0-9]{6}$/.test(pasteData)) {
      for (let i = 0; i < 6; i++) {
        this.otpForm.controls[`digit${i + 1}`].setValue(pasteData[i]);
      }

      this._commonService.setMessage(null);
      this.verifyOtp();
    } else {
      this._commonService.setMessage({
        type: 'error',
        message: 'FOR_REG_AND_LOGIN_ERROR.INVALID_OTP',
      });

      // Clear form
      Object.keys(this.otpForm.controls).forEach(key => {
        this.otpForm.controls[key].setValue('');
      });

      this.digit1Ref?.nativeElement?.focus();
    }

    // Reset the flag after short delay to avoid premature clearing
    setTimeout(() => {
      this.isPaste = false;
    }, 500);
  }

  resendOtp() {
    if (this.showMessage && !this.isPaste) {
      this._commonService.setMessage(null);
    }
    this.subscriptions.push(
      this._store.dispatch(new SendOtp({ ...this.sendOtpParam, is_resend: 1 })).subscribe({
        next: () => {
          this.remainingTime = 60;
          this.startOtpTimer();
          this._commonService.setMessage({
            type: 'success',
            message: 'REGISTRATION_PAGE.SENT_VERIFICATION_MESSAGE',
          });
        },
        error: apiError => {
          if (apiError.error.response.status.msg === 'Otp_quota_exceeded') {
            this._commonService.setMessage({
              type: 'error',
              message: 'FOR_REG_AND_LOGIN_ERROR.OTP_QUOTA_EXCEED',
            });
            this._authService.logout();
            this._router.navigate(['/login']);
          } else if (apiError.error.response.status.msg === 'Email_not_found') {
            this._commonService.setMessage({
              type: 'error',
              message: 'FOR_REG_AND_LOGIN_ERROR.EMAIL_NOT_FOUND',
            });
          } else if (
            apiError.error.response.status.msg === 'Something went wrong, please try again later.'
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
        },
      })
    );
  }

  //  otp timer

  startOtpTimer(): void {
    this.message = `OTP is valid for ${this.remainingTime} seconds.`;
    this.timer$ = timer(0, 1000).pipe(
      take(this.remainingTime) // Emit values up to the remaining time
    );

    // Subscribe to the timer observable to update the countdown
    this.timerSubscription = this.timer$.subscribe({
      next: () => {
        this.remainingTime = this.remainingTime - 1; // Decrease remaining time}
        localStorage.setItem('otp_remaining_time', this.remainingTime.toString());
        if (this.remainingTime === 0) {
          this.timerSubscription?.unsubscribe();
        }
      },
      complete: () => {
        // When timer completes (expires), disable OTP
        // this.otp = ''; // Clear the OTP
      },
    });
  }

  verifyOtp(showError = false) {
    if (showError) {
      this.submitted = true;
    }
    if (this.showMessage) {
      this._commonService.setMessage(null);
    }
    if (!this.isDisabled && this.otpForm.valid) {
      const formValue = this.otpForm.value;
      // stop here if form is invalid
      const param: IVerifyOtp = {
        ...this.sendOtpParam,
        otp:
          formValue.digit1 +
          formValue.digit2 +
          formValue.digit3 +
          formValue.digit4 +
          formValue.digit5 +
          formValue.digit6,
      };
      this.isDisabled = true;
      this.subscriptions.push(
        this._store.dispatch(new VerifyOtp(param)).subscribe({
          next: () => {
            this.isDisabled = false;
            this.submitted = false;
            // this._commonService.setMessage({
            //   type: 'success',
            //   message: 'OTP_PAGE.OTP_VERIFIED_SUCCESSFULL_MESSAGE',
            // });
            this.reDirectToImageUpload();
          },
          error: apiError => {
            this.isDisabled = false;
            this.submitted = false;
            this.initOtpForm();
            this.digit1Ref.nativeElement.focus();
            if (apiError.error.response.status.msg === 'Invalid_otp') {
              this._commonService.setMessage({
                type: 'error',
                message: 'FOR_REG_AND_LOGIN_ERROR.INVALID_OTP',
              });
            } else if (apiError.error.response.status.msg === 'Otp_expired') {
              this._commonService.setMessage({
                type: 'error',
                message: 'FOR_REG_AND_LOGIN_ERROR.OTP_EXPIRE',
              });
            } else if (
              apiError.error.response.status.msg === 'Something went wrong, please try again later.'
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
          },
        })
      );
    }
  }

  reDirectToImageUpload() {
    this.subscriptions.push(
      this._store.dispatch(new GetAllImages()).subscribe({
        next: () => {
          this._router.navigate(['/image-upload']);
        },
        error: apiError => {
          this._toastr.error(apiError.error.response.status.msg, 'Error', {
            closeButton: true,
            timeOut: 3000,
          });
        },
      })
    );
  }

  backToLogin(event: Event) {
    event.preventDefault();
    this._commonService.setMessage(null);
    this._authService.logout();
    this._router.navigate(['/login']);
    this.closeWarningDialog();
  }

  ngOnDestroy(): void {
    this._commonService.setMessage(null);
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.timerSubscription?.unsubscribe();
    localStorage.removeItem('otp_remaining_time');
  }
}
