import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { appSettings } from '@app/config';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CropImageComponent } from '../../components';
import { AuthHeaderComponent } from '@app/core/layouts/auth';
import {
  DeleteProfileImage,
  GetAllImages,
  GetRegQuestions,
  PatchProfileDetails,
  RegistrationState,
  UploadProfileImage,
} from '@app/store';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '@app/core/authentication';
import {
  inject,
  OnInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { CustomToastComponent } from '../../../../../../shared/components/custom-toast/custom-toast.component';
import { CommonService } from '@app/core/services';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [AuthHeaderComponent, CommonModule, TranslatePipe, CustomToastComponent],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
})
export class ImageUploadComponent implements OnInit, OnDestroy {
  readonly dialog = inject(MatDialog);
  public croppedUrl: string[] = [];
  private _router = inject(Router);
  private _store = inject(Store);
  public _toastr = inject(ToastrService);
  public filesArr: File[] = [];
  private credentials: string = appSettings.credentialsKey;
  @ViewChild('fileref') fileUploadRef!: ElementRef;
  @ViewChild('files') fileRef_afterUpload!: ElementRef;
  public profileData: IViewProfile | null = null;
  private profileDetails$: Observable<IViewProfile | null> = this._store.select(
    RegistrationState.profileDetails
  );
  public showMessage: { type: string; message: string } | null = null;
  public supported_files: string[] = ['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'];

  private allImages$: Observable<IAllImages[] | null> = this._store.select(
    RegistrationState.getAllImages
  );
  public allImages: IAllImages[] = [];
  public isSetProfileImage: boolean = false;
  public isLoaded: boolean = false;
  public isImageDelete = false;
  private subscriptions: Subscription[] = [];
  public language: string = 'chinese';
  private deleteImageIndex: number | undefined = undefined;
  public warningDialogRef!: MatDialogRef<string, any>;
  @ViewChild('warningDialog') warningDialog!: TemplateRef<string>;

  constructor(
    private _translate: TranslateService,
    private _authService: AuthenticationService,
    private _commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.getAllimagesFromStore();
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
      this._commonService.setMessage(null);
    }
    this.language = this._translate.currentLang === 'zh' ? 'chinese' : 'english';
    this.subscriptions.push(
      this._translate.onLangChange.subscribe(event => {
        this.language = event.lang === 'zh' ? 'chinese' : 'english';
      }),
      this._commonService.apiMessage$.subscribe(data => {
        this.showMessage = data;
      })
    );
  }
  getAllimagesFromStore() {
    this.subscriptions.push(
      this.allImages$.subscribe({
        next: apiResult => {
          if (apiResult !== null) {
            this.allImages = apiResult;
            this.isSetProfileImage = this.allImages.some(item => item.is_main_image === true);
            this.isLoaded = true;
          } else {
            this.fetchGetAllImages();
          }
        },
      })
    );
  }

  fetchGetAllImages() {
    this.isLoaded = false;
    this.subscriptions.push(
      this._store.dispatch(new GetAllImages()).subscribe({
        next: () => {
          this.isLoaded = true;
        },
        error: apiError => {
          this.isLoaded = true;
          this._toastr.error(apiError.error.response.status.msg, 'Error', {
            closeButton: true,
            timeOut: 3000,
          });
        },
      })
    );
  }

  // file input
  fileChangeEvent(event: Event): void {
    if (this.showMessage) {
      this._commonService.setMessage(null);
    }
    let files = (event?.target as HTMLInputElement).files as FileList;
    if (files && this.allImages.length < 12) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const extension = file.name.split('.').pop()?.toLowerCase();
        const fileSize = file.size;

        if (extension && this.supported_files.includes(extension)) {
          const reader = new FileReader();

          reader.onload = () => {
            const imageUrl = reader.result as string;

            const dialogRef = this.dialog.open(CropImageComponent, {
              panelClass: 'crop-image-modal',
              data: {
                imageUrl, // send the Base64 image
                fileName: file.name,
                fileType: file.type,
              },
            });

            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                // this.croppedUrl.push(result.url);

                const fileType = result.fileInfo[0].type;
                const image = new File([result.blob], result.fileInfo[0].name, {
                  type: fileType,
                });
                const addedImage = {
                  image_path: result.url,
                  is_main_image: false,
                  is_verified: false,
                };

                this.allImages.push(addedImage);
              }

              files = {} as FileList;

              if (!this.isSetProfileImage && this.allImages.length && this.profileData) {
                this.allImages[0].is_main_image = true;
                this.profileData = {
                  ...this.profileData,
                  profile_image: this.allImages[0].image_path,
                };
                this._store.dispatch(new PatchProfileDetails(this.profileData));
                this.isSetProfileImage = this.allImages.some(item => item.is_main_image === true);
              }
            });
          };

          reader.readAsDataURL(file); // Convert file to Base64 string
        } else {
          this._commonService.setMessage({
            type: 'error',
            message: 'IMAGEUPLOAD_PAGE.SHOULD_FILE_JPG_PNG_JPEG',
          });
        }
        if (this.fileUploadRef) {
          this.fileUploadRef.nativeElement.value = '';
        }
        if (this.fileRef_afterUpload) {
          this.fileRef_afterUpload.nativeElement.value = '';
        }
      }
    } else {
      this._commonService.setMessage({
        type: 'error',
        message: 'IMAGEUPLOAD_PAGE.MAXIMUM_IMAGE_ALLOWED',
      });
    }
  }

  goToPartnerPreference() {
    if (this.profileData) {
      this.profileData = {
        ...this.profileData,
        registration_status: 4,
      };
      this._store.dispatch(new PatchProfileDetails(this.profileData));
    }
    const param = {
      questionnaire_type_id: 1,
    };
    this.subscriptions.push(
      this._store.dispatch(new GetRegQuestions(param)).subscribe({
        next: () => {
          this._router.navigate(['/partner-preference']);
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

  setAsProfilePhoto(selectedIndex: number, selectedItem: IAllImages) {
    if (this.showMessage) {
      this._commonService.setMessage(null);
    }
    const formData = new FormData();
    formData.append('upload_files', '');
    formData.append('set_dp_pos', selectedIndex.toString());
    this.subscriptions.push(
      this._store.dispatch(new UploadProfileImage(formData)).subscribe({
        next: () => {
          this.allImages = this.allImages.map((item, ind) => {
            if (selectedIndex === ind) {
              return {
                ...item,
                image_path: item.image_path,
                is_main_image: true,
                is_verified: false,
              };
            } else {
              return {
                ...item,
                image_path: item.image_path,
                is_main_image: false,
                is_verified: false,
              };
            }
          });
          this.isSetProfileImage = this.allImages.some(item => item.is_main_image === true);
          if (this.profileData) {
            this.profileData = {
              ...this.profileData,
              profile_image: selectedItem.image_path,
            };
            this._store.dispatch(new PatchProfileDetails(this.profileData));
            this._commonService.setMessage({
              type: 'success',
              message: 'IMAGEUPLOAD_PAGE.SUCCESSFULLY_SET_PROFILE',
            });
          }
        },
        error: apiError => {
          this._toastr.error(apiError.error.response.status.msg, 'error', {
            closeButton: true,
            timeOut: 3000,
          });
        },
      })
    );
  }

  //Alert Dialog//
  public openWarningDialog(event: Event, index: number) {
    if (this.showMessage) {
      this._commonService.setMessage(null);
    }
    event.stopPropagation();
    this.deleteImageIndex = index;
    this.warningDialogRef = this.dialog.open(this.warningDialog, {
      panelClass: 'warning-dialog',
      backdropClass: 'customDialogBackdrop',
      hasBackdrop: true,
      disableClose: true,
    });
  }

  public closeWarningDialog() {
    this.deleteImageIndex = undefined;
    this.warningDialogRef.close();
  }

  removeImage() {
    if (this.deleteImageIndex || this.deleteImageIndex === 0) {
      this.isImageDelete = true;
      this.subscriptions.push(
        this._store
          .dispatch(new DeleteProfileImage({ delete_position: [this.deleteImageIndex] }))
          .subscribe({
            next: () => {
              if (this.deleteImageIndex || this.deleteImageIndex === 0) {
                this.allImages.splice(this.deleteImageIndex, 1);
              }
              this.closeWarningDialog();
              this.isImageDelete = false;
              this._commonService.setMessage({
                type: 'success',
                message: 'SUCCESS_REGISTRATION.PROFILE_IMAGE_DELETE',
              });
              this.deleteImageIndex = undefined;
            },
            error: apiError => {
              this.closeWarningDialog();
              this.isImageDelete = false;
              this._toastr.error(apiError.error.response.status.msg, 'error', {
                closeButton: true,
                timeOut: 3000,
              });
            },
          })
      );
    }
  }

  nextSubmit() {
    if (this.allImages.length >= 3) {
      if (this.isSetProfileImage) {
        this.goToPartnerPreference();
        this._commonService.setMessage(null);
      } else {
        this._commonService.setMessage({
          type: 'error',
          message: 'IMAGEUPLOAD_PAGE.SELECT_PROFILE_IMAGE',
        });
      }
    } else {
      this._commonService.setMessage({
        type: 'error',
        message: 'IMAGEUPLOAD_PAGE.REQUIRED_MINIMUM_THREE_PHOTOS',
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
