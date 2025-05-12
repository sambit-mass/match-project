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
  selector: 'app-personality-interest-complete',
  standalone: true,
  imports: [AuthHeaderComponent, TranslatePipe, TypingDirective],
  templateUrl: './personality-interest-complete.component.html',
  styleUrl: './personality-interest-complete.component.scss',
})
export class PersonalityInterestCompleteComponent implements OnDestroy {
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
        if (details && details.ques_submit_status !== 5) {
          this._router.navigate(['/personality-interests']);
        }
      },
    });
  }

  goToRelationshipPreference() {
    const param = {
      questionnaire_type_id: 6,
    };
    this.subscriptions.push(
      this._store.dispatch(new GetRegQuestions(param)).subscribe({
        next: () => {
          this._router.navigate(['/relationship-preference']);
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
