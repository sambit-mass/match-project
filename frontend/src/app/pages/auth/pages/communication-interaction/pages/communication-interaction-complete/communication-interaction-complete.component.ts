import { Component, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthHeaderComponent } from '@app/core/layouts/auth';
import { TypingDirective } from '@app/shared/directives';
import { GetRegQuestions, RegistrationState } from '@app/store';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-communication-interaction-complete',
  standalone: true,
  imports: [AuthHeaderComponent, TranslatePipe, TypingDirective],
  templateUrl: './communication-interaction-complete.component.html',
  styleUrl: './communication-interaction-complete.component.scss',
})
export class CommunicationInteractionCompleteComponent implements OnDestroy {
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
        if (details && details.ques_submit_status !== 8) {
          this._router.navigate(['/communication-interaction']);
        }
      },
    });
  }
  goToFutureAspiration() {
    const param = {
      questionnaire_type_id: 9,
    };
    this.subscriptions.push(
      this._store.dispatch(new GetRegQuestions(param)).subscribe({
        next: () => {
          this._router.navigate(['/future-aspiration']);
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
