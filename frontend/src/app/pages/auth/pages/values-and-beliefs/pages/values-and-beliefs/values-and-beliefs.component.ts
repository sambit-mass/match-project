import {
  FormGroup,
  FormControl,
  FormsModule,
  FormBuilder,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { appSettings } from '@app/config';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { AuthHeaderComponent } from '@app/core/layouts/auth';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { GetRegQuestions, RegistrationState, SaveAllAnswer } from '@app/store';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RegistrationQuestionHeaderComponent } from '../../../../../../shared/components/registration-question-header/registration-question-header.component';
@Component({
  selector: 'app-values-and-beliefs',
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
  templateUrl: './values-and-beliefs.component.html',
  styleUrl: './values-and-beliefs.component.scss',
})
export class ValuesAndBeliefsComponent implements OnInit, OnDestroy {
  thumbLabel = true;
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
    marriage_views: [],
    important_values: [],
    goal_outlook: [],
    organization_importance: [],
    vacation_preference: [],
    fitness_importance: [],
    environmental_concern: [],
  };

  public optionList: Record<string, IOption[] | []> = {
    marriage_views: [],
    important_values: [],
    goal_outlook: [],
    organization_importance: [],
    vacation_preference: [],
    fitness_importance: [],
    environmental_concern: [],
  };

  public selectedValue: Record<string, string[]> = {
    marriage_views: [],
    important_values: [],
    goal_outlook: [],
    organization_importance: [],
    vacation_preference: [],
    fitness_importance: [],
    environmental_concern: [],
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
              if (this.regQuestionList[i].questionnaire_type_id === 4) {
                const questions = this.regQuestionList[i].questions;
                this.questionLength = questions.length;
                this.questionListObject = this.regQuestionList[i].questionnaire_type;
                for (let j = 0; j < questions.length; j++) {
                  switch (questions[j].q_id) {
                    case 29: {
                      this.optionList['marriage_views'] = questions[j].options;
                      break;
                    }
                    case 30: {
                      this.optionList['important_values'] = questions[j].options;
                      break;
                    }
                    case 31: {
                      this.optionList['goal_outlook'] = questions[j].options;
                      break;
                    }
                    case 32: {
                      this.optionList['organization_importance'] = questions[j].options;
                      break;
                    }
                    case 33: {
                      this.optionList['vacation_preference'] = questions[j].options;
                      break;
                    }
                    case 34: {
                      this.optionList['fitness_importance'] = questions[j].options;
                      break;
                    }
                    case 35: {
                      this.optionList['environmental_concern'] = questions[j].options;
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
      this._store.dispatch(new GetRegQuestions({ questionnaire_type_id: 4 })).subscribe()
    );
  }

  initializeQuestionFrom() {
    this.questionForm = this.fb.group({
      marriage_views: this.fb.array(
        this.optionList['marriage_views'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      important_values: this.fb.array(
        this.optionList['important_values'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      goal_outlook: this.fb.array(
        this.optionList['goal_outlook'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      organization_importance: this.fb.array(
        this.optionList['organization_importance'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      vacation_preference: this.fb.array(
        this.optionList['vacation_preference'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      fitness_importance: this.fb.array(
        this.optionList['fitness_importance'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      environmental_concern: this.fb.array(
        this.optionList['environmental_concern'].map(() => false) // Initialize all checkboxes as unchecked
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
      if (this.selectedId[formType].includes(answerId)) {
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
      case 29:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 30:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 31:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 32:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 33:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 34:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 35:
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
        const param = {
          answers_data: [
            {
              questionnaire_id: 4,
              answers: [
                {
                  q_id: 29,
                  field_name: 'marriage_views',
                  sel_opt_id: this.selectedId['marriage_views'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['marriage_views'],
                },
                {
                  q_id: 30,
                  field_name: 'important_values',
                  sel_opt_id: this.selectedId['important_values'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['important_values'],
                },
                {
                  q_id: 31,
                  field_name: 'goal_outlook',
                  sel_opt_id: this.selectedId['goal_outlook'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['goal_outlook'],
                },
                {
                  q_id: 32,
                  field_name: 'organization_importance',
                  sel_opt_id: this.selectedId['organization_importance'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['organization_importance'],
                },
                {
                  q_id: 33,
                  field_name: 'vacation_preference',
                  sel_opt_id: this.selectedId['vacation_preference'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['vacation_preference'],
                },
                {
                  q_id: 34,
                  field_name: 'fitness_importance',
                  sel_opt_id: this.selectedId['fitness_importance'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['fitness_importance'],
                },
                {
                  q_id: 35,
                  field_name: 'environmental_concern',
                  sel_opt_id: this.selectedId['environmental_concern'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['environmental_concern'],
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
              this._router.navigate(['/values-and-beliefs/complete']);
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
