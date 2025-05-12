import {
  FormGroup,
  FormsModule,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { appSettings } from '@app/config';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Subscription, Observable } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { AuthHeaderComponent } from '@app/core/layouts/auth';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { RegistrationState, GetRegQuestions, SaveAllAnswer } from '@app/store';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { atLeastOneSelectedValidator } from '@app/shared/validators/at-least-one-select.validator';
import { RegistrationQuestionHeaderComponent } from '../../../../../../shared/components/registration-question-header/registration-question-header.component';

@Component({
  selector: 'app-lifestyle-preference',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TranslatePipe,
    MatInputModule,
    MatInputModule,
    MatSliderModule,
    MatStepperModule,
    ReactiveFormsModule,
    AuthHeaderComponent,
    RegistrationQuestionHeaderComponent,
  ],
  templateUrl: './lifestyle-preference.component.html',
  styleUrl: './lifestyle-preference.component.scss',
})
export class LifestylePreferenceComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private _store = inject(Store);
  private regQuestionList$: Observable<IQuestionnaire[]> = this._store.select(
    RegistrationState.regQuestionList
  );
  public regQuestionList: IQuestionnaire[] = [];
  public questionListObject: ILanguageText = {
    en: '',
    zh: '',
  };
  public selectedIndex = 0;
  public submitted = false;
  public isDisabled = false;

  public questionForm!: FormGroup;

  public selectedId: Record<string, number[]> = {
    cooking_interest: [],
    exercise_frequency: [],
    living_environment: [],
    mealtime_importance: [],
    dietary_preferences: [],
    pet_preference: [],
    weekend_activities: [],
  };

  public optionList: Record<string, IOption[] | []> = {
    cooking_interest: [],
    exercise_frequency: [],
    living_environment: [],
    mealtime_importance: [],
    dietary_preferences: [],
    pet_preference: [],
    weekend_activities: [],
  };

  public selectedValue: Record<string, string[]> = {
    cooking_interest: [],
    exercise_frequency: [],
    living_environment: [],
    mealtime_importance: [],
    dietary_preferences: [],
    pet_preference: [],
    weekend_activities: [],
  };

  public language: string | null = 'english';
  @ViewChild('stepper') stepper!: MatStepper;
  public count: number = 1;
  public questionLength: number = 0;
  private credentials: string = appSettings.credentialsKey;

  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _toastr: ToastrService,
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
              if (this.regQuestionList[i].questionnaire_type_id === 3) {
                const questions = this.regQuestionList[i].questions;
                this.questionLength = questions.length;
                this.questionListObject = this.regQuestionList[i].questionnaire_type;
                for (let j = 0; j < questions.length; j++) {
                  switch (questions[j].q_id) {
                    case 22: {
                      this.optionList['cooking_interest'] = questions[j].options;
                      break;
                    }
                    case 23: {
                      this.optionList['exercise_frequency'] = questions[j].options;
                      break;
                    }
                    case 24: {
                      this.optionList['living_environment'] = questions[j].options;
                      break;
                    }
                    case 25: {
                      this.optionList['mealtime_importance'] = questions[j].options;
                      break;
                    }
                    case 26: {
                      this.optionList['dietary_preferences'] = questions[j].options;
                      break;
                    }
                    case 27: {
                      this.optionList['pet_preference'] = questions[j].options;
                      break;
                    }
                    case 28: {
                      this.optionList['weekend_activities'] = questions[j].options;
                      break;
                    }
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

  private fetchRegQuestion() {
    this.subscriptions.push(
      this._store.dispatch(new GetRegQuestions({ questionnaire_type_id: 3 })).subscribe({})
    );
  }

  initializeQuestionFrom() {
    this.questionForm = this.fb.group({
      cooking_interest: this.fb.array(
        this.optionList['cooking_interest'].map(() => false),
        atLeastOneSelectedValidator() // Initialize all checkboxes as unchecked
      ),
      exercise_frequency: this.fb.array(
        this.optionList['exercise_frequency'].map(() => false),
        atLeastOneSelectedValidator() // Initialize all checkboxes as unchecked
      ),
      living_environment: this.fb.array(
        this.optionList['living_environment'].map(() => false),
        atLeastOneSelectedValidator() // Initialize all checkboxes as unchecked
      ),
      mealtime_importance: this.fb.array(
        this.optionList['mealtime_importance'].map(() => false),
        atLeastOneSelectedValidator() // Initialize all checkboxes as unchecked
      ),
      dietary_preferences: this.fb.array(
        this.optionList['dietary_preferences'].map(() => false),
        atLeastOneSelectedValidator() // Initialize all checkboxes as unchecked
      ),
      pet_preference: this.fb.array(
        this.optionList['pet_preference'].map(() => false),
        atLeastOneSelectedValidator() // Initialize all checkboxes as unchecked
      ),
      weekend_activities: this.fb.array(
        this.optionList['weekend_activities'].map(() => false),
        atLeastOneSelectedValidator() // Initialize all checkboxes as unchecked
      ),
    });
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
  getFormArray(control: string) {
    return this.questionForm.controls[control] as FormArray;
  }

  goToNextStep(controlName?: string) {
    this.selectedIndex++;
    if (this.count < this.questionLength) {
      this.count++;
    }
    const scrollElements = document.scrollingElement;
    if (scrollElements) scrollElements.scrollTop = 0;
  }
  goToPrevious() {
    this.selectedIndex--;
    this.count--;
    const scrollElements = document.scrollingElement;
    if (scrollElements) scrollElements.scrollTop = 0;
  }

  getAnswer(
    answerId: number,
    selectType: number,
    isChecked: boolean,
    answer: string,
    formType: string,
    index: number
  ) {
    if (selectType === 0 || answer === 'Prefer not to say' || answer === '不愿透露') {
      for (let i = 0; i < this.optionList[formType].length; i++) {
        if (index !== i) this.getFormArray(formType).at(i).setValue(false);
      }
      this.selectedId[formType] = [answerId];
      this.selectedValue[formType] = [answer];
    } else {
      if (
        this.selectedId[formType].includes(answerId) &&
        this.selectedId[formType].includes(answerId)
      ) {
        this.selectedId[formType].splice(this.selectedId[formType].indexOf(answerId), 1);
        this.selectedValue[formType].splice(this.selectedValue[formType].indexOf(answer), 1);
      } else {
        if (this.selectedId[formType].length >= 4) {
          return;
        } else {
          if (
            this.selectedValue[formType].includes('Prefer not to say') ||
            this.selectedValue[formType].includes('不愿透露')
          ) {
            let notSayIndex = this.optionList[formType].findIndex(
              item => item.en === 'Prefer not to say' || item.zh === '不愿透露'
            );
            for (let i = 0; i < this.optionList[formType].length; i++) {
              if (notSayIndex === i) this.getFormArray(formType).at(i).setValue(false);
            }
            this.selectedId[formType].splice(
              this.selectedId[formType]?.indexOf(this.optionList[formType][notSayIndex].op_id),
              1
            );
            this.selectedValue[formType].splice(
              this.selectedValue[
                this.optionList[formType][notSayIndex].en ||
                  this.optionList[formType][notSayIndex].zh
              ]?.indexOf(answer),
              1
            );
          }
          this.selectedId[formType].push(answerId);
          this.selectedValue[formType].push(answer);
        }
      }
    }
  }

  onclickAnswer(
    answerId: number,
    question: number,
    selectType: number,
    event: Event,
    answer: string,
    formType: string,
    index: number
  ) {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;

    switch (question) {
      case 22:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 23:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 24:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 25:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 26:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 27:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 28:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;

      default:
        // handle default
        break;
    }
  }

  saveAnswer() {
    if (!this.isDisabled) {
      this.submitted = true;
      if (this.questionForm.valid) {
        this.isDisabled = true;
        const formValue = this.questionForm.getRawValue();
        const param = {
          answers_data: [
            {
              questionnaire_id: 3,
              answers: [
                {
                  q_id: 22,
                  field_name: 'cooking_interest',
                  sel_opt_id: this.selectedId['cooking_interest'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['cooking_interest'],
                },
                {
                  q_id: 23,
                  field_name: 'exercise_frequency',
                  sel_opt_id: this.selectedId['exercise_frequency'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['exercise_frequency'],
                },
                {
                  q_id: 24,
                  field_name: 'living_environment',
                  sel_opt_id: this.selectedId['living_environment'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['living_environment'],
                },
                {
                  q_id: 25,
                  field_name: 'mealtime_importance',
                  sel_opt_id: this.selectedId['mealtime_importance'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['mealtime_importance'],
                },
                {
                  q_id: 26,
                  field_name: 'dietary_preferences',
                  sel_opt_id: this.selectedId['dietary_preferences'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['dietary_preferences'],
                },
                {
                  q_id: 27,
                  field_name: 'pet_preference',
                  sel_opt_id: this.selectedId['pet_preference'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['pet_preference'],
                },
                {
                  q_id: 28,
                  field_name: 'weekend_activities',
                  sel_opt_id: this.selectedId['weekend_activities'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['weekend_activities'],
                },
              ],
            },
          ],
        };
        this.subscriptions.push(
          this._store.dispatch(new SaveAllAnswer(param)).subscribe({
            next: () => {
              this.submitted = false;
              this.isDisabled = false;
              this._router.navigate(['/lifestyle-Preference/complete']);
            },
            error: apiError => {
              this.submitted = false;
              this.isDisabled = false;
              this._toastr.error(apiError.error.response.status.msg, 'Error', {
                closeButton: true,
                timeOut: 3000,
              });
            },
          })
        );
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
