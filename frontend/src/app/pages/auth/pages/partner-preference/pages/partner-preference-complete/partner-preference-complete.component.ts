import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GetRegQuestions, RegistrationState } from '@app/store';
import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, OnDestroy } from '@angular/core';
import { AuthHeaderComponent } from '@app/core/layouts/auth';
import { TypingDirective } from '@app/shared/directives';

@Component({
  selector: 'app-partner-preference-complete',
  standalone: true,
  imports: [AuthHeaderComponent, TranslatePipe, TypingDirective],
  templateUrl: './partner-preference-complete.component.html',
  styleUrl: './partner-preference-complete.component.scss',
})
export class PartnerPreferenceCompleteComponent implements OnDestroy {
  public subscriptions: Subscription[] = [];
  private _store = inject(Store);
  private profileDetails$: Observable<IViewProfile | null> = this._store.select(
    RegistrationState.profileDetails
  );

  constructor(
    private _router: Router,
    private _toastr: ToastrService
  ) {
    this.subscriptions.push(
      this.profileDetails$.subscribe({
        next: details => {
          if (details && details.ques_submit_status !== 1) {
            this._router.navigate(['/partner-preference']);
          }
        },
      })
    );
  }

  goToProfileBasics() {
    const param = {
      questionnaire_type_id: 2,
    };
    this.subscriptions.push(
      this._store.dispatch(new GetRegQuestions(param)).subscribe({
        next: () => {
          this._router.navigate(['/profile-basics']);
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
