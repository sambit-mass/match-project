import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonService } from '@app/core/services';
import { TranslatePipe } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-web-leftbar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './web-leftbar.component.html',
  styleUrl: './web-leftbar.component.scss',
})
export class WebLeftbarComponent implements OnInit, OnDestroy {
  public showCategorySubmenu = false;
  private subscriptions: Subscription[] = [];

  constructor(private _commonService: CommonService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this._commonService.showCategorySubmenu$.subscribe(
        isShow => (this.showCategorySubmenu = isShow)
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
