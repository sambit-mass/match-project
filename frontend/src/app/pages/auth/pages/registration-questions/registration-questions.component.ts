import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, Observable } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { AuthHeaderComponent } from '@app/core/layouts/auth';
import { GetRegQuestions, RegistrationState } from '@app/store';
import { CommonService, EncryptionService } from '@app/core/services';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-registration-questions',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatInputModule,
    MatSliderModule,
    MatStepperModule,
    AuthHeaderComponent,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  styleUrl: './registration-questions.component.scss',
  templateUrl: './registration-questions.component.html',
})
export class RegistrationQuestionsComponent implements OnInit, OnDestroy {
  public max = 70;
  public min = 18;
  public submitted = false;
  public thumbLabel = true;
  private _store = inject(Store);
  public questionForm!: FormGroup;
  public selectedOptions: number[] = [];
  public optionList: IOption[] = [];
  public language: string = 'english';
  private subscriptions: Subscription[] = [];
  public regQuestionList: IQuestionnaire[] = [];
  private regQuestionList$: Observable<IQuestionnaire[]> = this._store.select(
    RegistrationState.regQuestionList
  );

  public selectedIndex = 0;
  private preferredAgeFromValue: number = 0;
  @ViewChild('stepper') stepper!: MatStepper;
  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _encryptionService: EncryptionService,
    private _translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getDataFromStore();
    this.language = this._translate.currentLang === 'zh' ? 'chinese' : 'english';
    this.subscriptions.push(
      this._translate.onLangChange.subscribe(event => {
        this.language = event.lang === 'zh' ? 'chinese' : 'english';
      })
    );
  }

  private getDataFromStore() {
    this.subscriptions.push(
      this.regQuestionList$.subscribe({
        next: apiResult => {
          if (apiResult?.length) {
            this.regQuestionList = apiResult;
            for (let i = 0; i < this.regQuestionList.length; i++) {
              if (this.regQuestionList[i].questionnaire_type_id === 1) {
                const questions = this.regQuestionList[i].questions;
                for (let j = 0; j < questions.length; j++) {
                  if (questions[j].q_id === 1) {
                    this.optionList = questions[j].options;
                  }
                }
              } else {
                this.fetchRegQuestion();
              }
            }
            this.initializeQuestionFrom();
          } else {
            this.fetchRegQuestion();
          }
        },
      })
    );
  }

  initializeQuestionFrom() {
    this.questionForm = this.fb.group({
      seeking_for: this.fb.array(
        this.optionList.map(() => false) // Initialize all checkboxes as unchecke
      ),
      preferred_age_from: new FormControl(20),
      preferred_age_to: new FormControl(30),
    });
    this.preferredAgeFromValue = this.questionForm.controls['preferred_age_from'].value;
  }

  get seeking_forFormArray() {
    return this.questionForm.controls['seeking_for'] as FormArray;
  }

  /**
   * *Checking if control has error
   *
   * @param field form control name
   * @returns boolean
   */
  public hasFormControlError(field: string): boolean {
    const control = this.questionForm.get(field) as FormControl;
    if (this.submitted && (control?.errors || control?.invalid)) {
      return true;
    }
    return false;
  }

  /**
   * *Getting all form controls from broker admin form
   */
  get formControl() {
    return this.questionForm.controls;
  }

  private fetchRegQuestion() {
    this.subscriptions.push(
      this._store.dispatch(new GetRegQuestions({ questionnaire_type_id: 1 })).subscribe()
    );
  }

  /**
   * slider changes minimum one year gap maintain
   */
  onSliderChange() {
    const ageFrom = this.questionForm.controls['preferred_age_from'].value;
    const ageTo = this.questionForm.controls['preferred_age_to'].value;
    if (ageTo - ageFrom < 5) {
      if (ageFrom !== this.preferredAgeFromValue) {
        this.questionForm.controls['preferred_age_from'].setValue(ageTo - 5);
      } else {
        this.questionForm.controls['preferred_age_to'].setValue(ageFrom + 5);
      }
    }
    this.preferredAgeFromValue = this.questionForm.controls['preferred_age_from'].value;
  }

  onclickAnswer(
    answerId: number,
    question: number,
    index: number,
    selectType: number,
    event: Event
  ) {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;
    if (selectType === 0) {
      for (let i = 0; i < this.optionList.length; i++) {
        if (index !== i) this.seeking_forFormArray.at(i).setValue(false);
      }
      if (isChecked) {
        this.selectedOptions = [answerId];
      } else {
        this.selectedOptions = [];
      }
    } else {
      if (this.selectedOptions.includes(answerId)) {
        this.selectedOptions.splice(this.selectedOptions.indexOf(answerId), 1);
      } else {
        this.selectedOptions.push(answerId);
      }
    }
  }

  goToRegistration() {
    const selectData =
      this.optionList[this.questionForm.controls['seeking_for'].value.indexOf(true)];
    const sex = selectData.en.split(' ')[3];
    const answer = {
      op_id: selectData.op_id,
      age_from: this.questionForm.controls['preferred_age_from'].value,
      age_to: this.questionForm.controls['preferred_age_to'].value,
      gender: sex,
    };
    this._router.navigate(['/registration'], {
      queryParams: {
        enc: encodeURIComponent(
          this._encryptionService.encryptUsingAES256({
            social_type: 'registration',
            answer: { ...answer },
          })
        ),
      },
    });
  }

  prevStep() {
    this.selectedIndex--;
    const scrollElements = document.scrollingElement;
    if (scrollElements) scrollElements.scrollTop = 0;
  }

  goToNextStep() {
    if (this.questionForm.invalid) {
      this.submitted = true;
    } else {
      this.selectedIndex++;
      // this.stepper.next();
      this.submitted = false;
      const scrollElements = document.scrollingElement;
      if (scrollElements) scrollElements.scrollTop = 0;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
