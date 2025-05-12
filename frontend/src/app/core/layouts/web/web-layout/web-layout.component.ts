import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WebFooterComponent } from '../web-footer/web-footer.component';
import { WebHeaderComponent } from '../web-header/web-header.component';
import { WebLeftbarComponent } from '../web-leftbar/web-leftbar.component';
import { RightPanelComponent } from '@app/pages/web/profile/components/right-panel/right-panel.component';
import { Subscription } from 'rxjs';
import { CommonService } from '@app/core/services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'web-layout',
  standalone: true,
  imports: [
    RouterModule,
    WebHeaderComponent,
    WebFooterComponent,
    WebLeftbarComponent,
    RightPanelComponent,
    CommonModule,
  ],
  templateUrl: './web-layout.component.html',
  styleUrls: ['./web-layout.component.scss'],
})
export class WebLayoutComponent implements OnInit, OnDestroy {
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
