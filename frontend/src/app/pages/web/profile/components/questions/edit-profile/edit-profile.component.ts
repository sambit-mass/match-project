import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { fadeAnimation } from '@app/shared/animations';
import { PatchProfileDetails, RegistrationState, ViewProfile } from '@app/store';
import { UpdateProfile } from '@app/store/actions/profile.action';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    TranslatePipe,
  ],

  animations: [fadeAnimation],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss',
})
export class EditProfileComponent implements OnInit, OnDestroy {
  public submitted = false;
  public show_type = false;
  public isDisabled = false;
  private subscriptions: Subscription[] = [];
  private _formBuilder = inject(FormBuilder);
  public language: string = 'english';
  public EditProfileForm!: FormGroup;
  public profileData: IViewProfile | null = null;
  private _store = inject(Store);

  private profileDetails$: Observable<IViewProfile | null> = this._store.select(
    RegistrationState.profileDetails
  );
  @Input('editTypeId') editTypeId!: number;
  @Output() closeDialog = new EventEmitter();
  public payload: IUpdateProfilePayload | null = null;

  constructor(
    private _toastr: ToastrService,
    private _translate: TranslateService
  ) {}
  ngOnInit(): void {
    this.getProfileDataFromStore();
  }

  getProfileDataFromStore() {
    this.subscriptions.push(
      this.profileDetails$.subscribe({
        next: details => {
          if (details) {
            this.profileData = details;
            this.initEmailForm();
          }
        },
      })
    );
  }

  private initEmailForm(): void {
    this.EditProfileForm = this._formBuilder.group({
      city: new FormControl('', [Validators.maxLength(30)]),
      zipcode: new FormControl('', [Validators.maxLength(20)]),
      university: new FormControl(''),
      political_view: new FormControl(''),
    });

    this.patchEditProfileFormForm();
  }

  get formControl() {
    return this.EditProfileForm.controls;
  }

  public hasFormControlError(field: string): boolean {
    const control = this.EditProfileForm.get(field) as FormControl;
    if (this.submitted && (control.errors || control.invalid)) {
      return true;
    }
    return false;
  }

  patchEditProfileFormForm() {
    if (this.profileData) {
      this.EditProfileForm.patchValue({
        city: this.profileData.city,
        zipcode: this.profileData.zipcode,
        university: this.profileData.university,
        political_view: this.profileData.political_view,
      });
    }
  }

  public onSubmitUpdateProfile(): boolean | void {
    if (!this.isDisabled) {
      this.submitted = true;
      const formValue = this.EditProfileForm.getRawValue();
      //form is valid
      if (this.EditProfileForm.valid) {
        this.isDisabled = true;

        if (this.editTypeId === 10) {
          this.payload = {
            city: formValue.city,
            zipcode: formValue.zipcode,
          };
        } else if (this.editTypeId === 11) {
          this.payload = {
            university: formValue.university,
          };
        } else {
          this.payload = {
            political_view: formValue.political_view,
          };
        }
      }
      this.subscriptions.push(
        this._store.dispatch(new UpdateProfile(this.payload)).subscribe({
          next: apiResult => {
            if (this.profileData) {
              this.profileData = {
                ...this.profileData,
                city: formValue.city,
                zipcode: formValue.zipcode,
                university: formValue.university,
                political_view: formValue.political_view,
              };

              this._store.dispatch(new PatchProfileDetails(this.profileData));
            }
            this.closeDialog.emit();
          },
          error: apiError => {
            this.closeDialog.emit();
            this._toastr.error(apiError.error.response.status.msg, 'Error', {
              closeButton: true,
              timeOut: 3000,
            });
          },
        })
      );
    }
  }

  onCloseDialog(event: Event) {
    this.closeDialog.emit(event);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
