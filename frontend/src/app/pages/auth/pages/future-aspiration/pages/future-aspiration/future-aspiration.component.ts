import {
  FormGroup,
  FormBuilder,
  FormControl,
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
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { RegistrationState, GetRegQuestions, SaveAllAnswer } from '@app/store';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RegistrationQuestionHeaderComponent } from '../../../../../../shared/components/registration-question-header/registration-question-header.component';

@Component({
  selector: 'app-future-aspiration',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatInputModule,
    MatInputModule,
    MatSliderModule,
    MatStepperModule,
    ReactiveFormsModule,
    AuthHeaderComponent,
    TranslatePipe,
    RegistrationQuestionHeaderComponent,
  ],
  templateUrl: './future-aspiration.component.html',
  styleUrl: './future-aspiration.component.scss',
})
export class FutureAspirationComponent implements OnInit, OnDestroy {
  max = 243;
  min = 100;
  value1 = 25;
  value2 = 30;
  thumbLabel = true;
  private subscriptions: Subscription[] = [];
  private _store = inject(Store);
  private credentials: string = appSettings.credentialsKey;
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
    five_year_plan: [],
    ultimate_life_goal: [],
    goal_achievement_importance: [],
  };

  public optionList: Record<string, IOption[] | []> = {
    five_year_plan: [],
    ultimate_life_goal: [],
    goal_achievement_importance: [],
  };

  public selectedValue: Record<string, string[]> = {
    five_year_plan: [],
    ultimate_life_goal: [],
    goal_achievement_importance: [],
  };
  public language: string = 'english';
  @ViewChild('stepper') stepper!: MatStepper;

  public count: number = 1;
  public questionLength: number = 0;

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
              if (this.regQuestionList[i].questionnaire_type_id === 9) {
                const questions = this.regQuestionList[i].questions;
                this.questionLength = questions.length;
                this.questionListObject = this.regQuestionList[i].questionnaire_type;
                for (let j = 0; j < questions.length; j++) {
                  switch (questions[j].q_id) {
                    case 60: {
                      this.optionList['five_year_plan'] = questions[j].options;
                      break;
                    }
                    case 61: {
                      this.optionList['ultimate_life_goal'] = questions[j].options;
                      break;
                    }
                    case 62: {
                      this.optionList['goal_achievement_importance'] = questions[j].options;
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
      this._store.dispatch(new GetRegQuestions({ questionnaire_type_id: 9 })).subscribe()
    );
  }

  initializeQuestionFrom() {
    this.questionForm = this.fb.group({
      five_year_plan: this.fb.array(
        this.optionList['five_year_plan'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      ultimate_life_goal: this.fb.array(
        this.optionList['ultimate_life_goal'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      goal_achievement_importance: this.fb.array(
        this.optionList['goal_achievement_importance'].map(() => false) // Initialize all checkboxes as unchecked
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
  goToNextStep() {
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
      case 60:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 61:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 62:
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
              questionnaire_id: 9,
              answers: [
                {
                  q_id: 60,
                  field_name: 'five_year_plan',
                  sel_opt_id: this.selectedId['five_year_plan'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['five_year_plan'],
                },
                {
                  q_id: 61,
                  field_name: 'ultimate_life_goal',
                  sel_opt_id: this.selectedId['ultimate_life_goal'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['ultimate_life_goal'],
                },
                {
                  q_id: 62,
                  field_name: 'goal_achievement_importance',
                  sel_opt_id: this.selectedId['goal_achievement_importance'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['goal_achievement_importance'],
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
              this._router.navigate(['/introduction']);
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
