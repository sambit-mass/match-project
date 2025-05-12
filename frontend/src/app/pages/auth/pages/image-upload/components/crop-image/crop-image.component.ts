import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit,
  Inject,
  inject,
  OnDestroy,
} from '@angular/core';
import { StyleRenderer, lyl, WithStyles, ThemeRef, ThemeVariables } from '@alyle/ui';
import {
  ImgCropperConfig,
  ImgCropperEvent,
  LyImageCropper,
  ImgCropperLoaderConfig,
  STYLES as CROPPER_STYLES,
} from '@alyle/ui/image-cropper';
import { LySliderChange } from '@alyle/ui/slider';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LyImageCropperModule } from '@alyle/ui/image-cropper';
import { LyButtonModule } from '@alyle/ui/button';
import { LyIconModule } from '@alyle/ui/icon';
import { LySliderModule } from '@alyle/ui/slider';
import { TranslatePipe } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { UploadProfileImage } from '@app/store';
import { CommonService } from '@app/core/services';

const STYLES = (_theme: ThemeVariables, ref: ThemeRef) => {
  ref.renderStyleSheet(CROPPER_STYLES);
  return {
    cropper: lyl`{
      max-width: 700px
      height: 400px
      margin:0 auto
    }`,
    cropperResult: lyl`{
      position: relative
      width: 150px
      height: 150px
    }`,
    sliderContainer: lyl`{
      text-align: center
      max-width: 10000px 
      margin: 14px
    }`,
  };
};
@Component({
  selector: 'app-crop-image',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LyImageCropperModule,
    LySliderModule,
    LyButtonModule,
    LyIconModule,
    FormsModule,
    TranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StyleRenderer],
  templateUrl: './crop-image.component.html',
  styleUrl: './crop-image.component.scss',
})
export class CropImageComponent implements WithStyles, AfterViewInit, OnDestroy {
  classes: any;
  croppedImage?: string | null = null;
  scale!: number;
  ready = false;
  minScale!: number;
  readonly dialogRef = inject(MatDialogRef<CropImageComponent>);
  @ViewChild(LyImageCropper) cropper!: LyImageCropper;
  myConfig: ImgCropperConfig = {
    width: 350, // Default `250`
    height: 350, // Default `200`
    fill: '#ff2997', // Default transparent if type == png else #000
    type: 'image/jpeg', // Or you can also use `image/jpeg`
    responsiveArea: true,
  };
  finalCroppedResult: any;
  public subscriptions: Subscription[] = [];
  public isDisable: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      imageUrl: string;
      fileName: string;
      fileType: string;
      height: number;
      width: number;
    },
    readonly sRenderer: StyleRenderer,
    private _store: Store,
    private _toastr: ToastrService,
    private _commonService: CommonService
  ) {
    this.classes = this.sRenderer.renderSheet(STYLES);
  }

  ngAfterViewInit() {
    const config: ImgCropperLoaderConfig = {
      originalDataURL: this.data.imageUrl,
    };
    this.cropper.loadImage(config);
    // add img tag on top of canvas
    const canvasElement = document.getElementsByTagName('canvas');
    const parentElement = canvasElement[0].parentElement;
    if (canvasElement) {
      (canvasElement[0] as HTMLCanvasElement).style.opacity = '0';
      (canvasElement[0] as HTMLCanvasElement).style.visibility = 'hidden';
    }
    if (parentElement) {
      // Create the image element
      const img = document.createElement('img');
      img.src = this.data.imageUrl;
      img.style.position = 'absolute';
      img.style.top = '0';
      img.style.left = '0';
      img.style.width = '100%'; // Optional: make it cover canvas
      img.style.height = '100%';
      img.style.pointerEvents = 'none'; // So it doesn't block mouse events on canvas
      // Add it to the parent element
      parentElement.appendChild(img);
      parentElement.style.position = 'relative';
      parentElement.style.display = 'inline-block';
    }
  }

  onCropped(e: ImgCropperEvent) {
    this.croppedImage = e.dataURL;
    if (this.croppedImage) {
      const base64 = this.croppedImage.split(',')[1]; // Strip metadata
      const mimeType = this.data.fileType || 'image/jpeg';
      const fileName = this.data.fileName || 'cropped-image.jpeg';
      const blob = this.base64ToBlob(base64, mimeType);
      const file = new File([blob], fileName, {
        type: mimeType,
        lastModified: new Date().getTime(),
      });
      const url = URL.createObjectURL(blob);
      const result = {
        url,
        blob,
        fileInfo: {
          0: file,
          length: 1,
        },
      };

      this.finalCroppedResult = result;
    }
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteChars = atob(base64);
    const byteArrays = [];

    for (let i = 0; i < byteChars.length; i += 1024) {
      const slice = byteChars.slice(i, i + 1024);
      const byteNumbers = new Array(slice.length);
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  }

  uploadImage() {
    if (this.isDisable) return;
    this.isDisable = true;
    this.cropper.crop(); // Triggers cropping (if not already)
    const formData = new FormData();
    const cropedFile = this.finalCroppedResult.fileInfo[0];
    formData.append('upload_files', cropedFile);

    formData.append('set_dp_pos', '');

    this.subscriptions.push(
      this._store.dispatch(new UploadProfileImage(formData)).subscribe({
        next: () => {
          this.dialogRef.close(this.finalCroppedResult);
          this.isDisable = false; // Send back the full data object
          this._commonService.setMessage({
            type: 'success',
            message: 'IMAGEUPLOAD_PAGE.IMAGE_UPLOAD_SUCCESSFULLY',
          });
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

  onSliderInput(event: LySliderChange) {
    this.scale = event.value as number;
  }

  closeUploadImage() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe);
  }
}
