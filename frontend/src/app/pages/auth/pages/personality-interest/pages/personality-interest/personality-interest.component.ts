import {
  FormGroup,
  FormControl,
  FormBuilder,
  FormsModule,
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
import { RegistrationQuestionHeaderComponent } from '@app/shared/components/registration-question-header/registration-question-header.component';
@Component({
  selector: 'app-personality-interest',
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
  templateUrl: './personality-interest.component.html',
  styleUrl: './personality-interest.component.scss',
})
export class PersonalityInterestComponent implements OnInit, OnDestroy {
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
    hobbies: [],
    free_time_activities: [],
    reading_interest: [],
    music_interest: [],
    activity_preference: [],
    personality_description: [],
    challenge_approach: [],
  };

  public optionList: Record<string, IOption[] | []> = {
    hobbies: [],
    free_time_activities: [],
    reading_interest: [],
    music_interest: [],
    activity_preference: [],
    personality_description: [],
    challenge_approach: [],
  };

  public selectedValue: Record<string, string[]> = {
    hobbies: [],
    free_time_activities: [],
    reading_interest: [],
    music_interest: [],
    activity_preference: [],
    personality_description: [],
    challenge_approach: [],
  };

  public language: string = 'english';
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
              if (this.regQuestionList[i].questionnaire_type_id === 5) {
                const questions = this.regQuestionList[i].questions;
                this.questionLength = questions.length;
                this.questionListObject = this.regQuestionList[i].questionnaire_type;
                for (let j = 0; j < questions.length; j++) {
                  switch (questions[j].q_id) {
                    case 36: {
                      this.optionList['hobbies'] = questions[j].options;
                      break;
                    }
                    case 37: {
                      this.optionList['free_time_activities'] = questions[j].options;
                      break;
                    }
                    case 38: {
                      this.optionList['reading_interest'] = questions[j].options;
                      break;
                    }
                    case 39: {
                      this.optionList['music_interest'] = questions[j].options;
                      break;
                    }
                    case 40: {
                      this.optionList['activity_preference'] = questions[j].options;
                      break;
                    }
                    case 41: {
                      this.optionList['personality_description'] = questions[j].options;
                      break;
                    }
                    case 42: {
                      this.optionList['challenge_approach'] = questions[j].options;
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
      this._store.dispatch(new GetRegQuestions({ questionnaire_type_id: 5 })).subscribe()
    );
  }

  initializeQuestionFrom() {
    this.questionForm = this.fb.group({
      hobbies: this.fb.array(
        this.optionList['hobbies'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      free_time_activities: this.fb.array(
        this.optionList['free_time_activities'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      reading_interest: this.fb.array(
        this.optionList['reading_interest'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      music_interest: this.fb.array(
        this.optionList['music_interest'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      activity_preference: this.fb.array(
        this.optionList['activity_preference'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      personality_description: this.fb.array(
        this.optionList['personality_description'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      challenge_approach: this.fb.array(
        this.optionList['challenge_approach'].map(() => false) // Initialize all checkboxes as unchecked
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
      case 36:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 37:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 38:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 39:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 40:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 41:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 42:
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
              questionnaire_id: 5,
              answers: [
                {
                  q_id: 36,
                  field_name: 'hobbies',
                  sel_opt_id: this.selectedId['hobbies'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['hobbies'],
                },
                {
                  q_id: 37,
                  field_name: 'free_time_activities',
                  sel_opt_id: this.selectedId['free_time_activities'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['free_time_activities'],
                },
                {
                  q_id: 38,
                  field_name: 'reading_interest',
                  sel_opt_id: this.selectedId['reading_interest'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['reading_interest'],
                },
                {
                  q_id: 39,
                  field_name: 'music_interest',
                  sel_opt_id: this.selectedId['music_interest'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['music_interest'],
                },
                {
                  q_id: 40,
                  field_name: 'activity_preference',
                  sel_opt_id: this.selectedId['activity_preference'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['activity_preference'],
                },
                {
                  q_id: 41,
                  field_name: 'personality_description',
                  sel_opt_id: this.selectedId['personality_description'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['personality_description'],
                },
                {
                  q_id: 42,
                  field_name: 'challenge_approach',
                  sel_opt_id: this.selectedId['challenge_approach'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['challenge_approach'],
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
              this._router.navigate(['/personality-interests/complete']);
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
