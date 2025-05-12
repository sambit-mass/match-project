import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { GetRegQuestions } from '@app/store';
import { TranslatePipe } from '@ngx-translate/core';
import { Component, OnDestroy } from '@angular/core';
import { AuthFooterComponent, AuthHeaderComponent } from '@app/core/layouts/auth';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [AuthHeaderComponent, AuthFooterComponent, TranslatePipe],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnDestroy {
  private subscriptions: Subscription[] = [];
  constructor(
    private _router: Router,
    private _store: Store
  ) {}

  onSignUp() {
    this.subscriptions.push(
      this._store.dispatch(new GetRegQuestions({ questionnaire_type_id: 1 })).subscribe({
        next: () => {
          this._router.navigate(['/reg-question']);
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
