import { Component, inject, OnDestroy } from '@angular/core';
import { AuthHeaderComponent } from '@app/core/layouts/auth';
import { Router } from '@angular/router';
import { GetRegQuestions, RegistrationState } from '@app/store';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe } from '@ngx-translate/core';
import { TypingDirective } from '@app/shared/directives';

@Component({
  selector: 'app-lifestyle-preference-complete',
  standalone: true,
  imports: [AuthHeaderComponent, TranslatePipe, TypingDirective],
  templateUrl: './lifestyle-preference-complete.component.html',
  styleUrl: './lifestyle-preference-complete.component.scss',
})
export class LifestylePreferenceCompleteComponent implements OnDestroy {
  public subscriptions: Subscription[] = [];
  private _store = inject(Store);
  private profileDetails$: Observable<IViewProfile | null> = this._store.select(
    RegistrationState.profileDetails
  );
  constructor(
    private _router: Router,
    private _toastr: ToastrService
  ) {
    this.profileDetails$.subscribe({
      next: details => {
        if (details && details.ques_submit_status !== 3) {
          this._router.navigate(['/lifestyle-Preference']);
        }
      },
    });
  }

  goToValuesAndBeliefs() {
    const param = {
      questionnaire_type_id: 4,
    };
    this.subscriptions.push(
      this._store.dispatch(new GetRegQuestions(param)).subscribe({
        next: () => {
          this._router.navigate(['/values-and-beliefs']);
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
