import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GetRegQuestions, RegistrationState } from '@app/store';
import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, OnDestroy } from '@angular/core';
import { AuthHeaderComponent } from '@app/core/layouts/auth';
import { TypingDirective } from '@app/shared/directives';

@Component({
  selector: 'app-profile-basics-complete',
  standalone: true,
  imports: [AuthHeaderComponent, TranslatePipe, TypingDirective],
  templateUrl: './profile-basics-complete.component.html',
  styleUrl: './profile-basics-complete.component.scss',
})
export class ProfileBasicsCompleteComponent implements OnDestroy {
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
          if (details && details.ques_submit_status !== 2) {
            this._router.navigate(['/profile-basics']);
          }
        },
      })
    );
  }

  goToLifestyle() {
    const param = {
      questionnaire_type_id: 3,
    };
    this.subscriptions.push(
      this._store.dispatch(new GetRegQuestions(param)).subscribe({
        next: () => {
          this._router.navigate(['/lifestyle-Preference']);
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
