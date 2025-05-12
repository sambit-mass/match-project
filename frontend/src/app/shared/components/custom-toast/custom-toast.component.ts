import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '@app/core/services';
import { fadeAnimation, slideInOut } from '@app/shared/animations';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'custom-toast',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  animations: [fadeAnimation, slideInOut],
  templateUrl: './custom-toast.component.html',
  styleUrls: ['./custom-toast.component.scss'],
})
export class CustomToastComponent implements OnInit, OnDestroy {
  public message = '';
  public language = '';
  public subscriptions: Subscription[] = [];
  public showMessage: { type: string; message: string } | null = null;

  constructor(
    private _router: Router,
    private _translate: TranslateService,
    private _commonService: CommonService
  ) {}

  closeToastr() {
    this._commonService.setMessage(null);
  }

  ngOnInit(): void {
    this.language = this._translate.currentLang === 'zh' ? 'chinese' : 'english';
    this.subscriptions.push(
      this._translate.onLangChange.subscribe(event => {
        this.language = event.lang === 'zh' ? 'chinese' : 'english';
        if (this.showMessage && this.showMessage.message) {
          this.message = this._translate.instant(this.showMessage.message);
        }
      }),
      this._commonService.apiMessage$.subscribe(data => {
        this.showMessage = data;
        if (this.showMessage && this.showMessage.message) {
          this.message = this._translate.instant(this.showMessage.message);
        }
      })
    );
  }

  onSignIn() {
    this._router.navigate(['/login']);
    if (this.showMessage && this.showMessage.message) {
      this._commonService.setMessage(null);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
