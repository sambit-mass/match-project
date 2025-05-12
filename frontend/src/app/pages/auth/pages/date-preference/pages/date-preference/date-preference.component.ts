import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
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
import { RegistrationQuestionHeaderComponent } from '@app/shared/components/registration-question-header/registration-question-header.component';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-date-preference',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TranslatePipe,
    MatInputModule,
    MatSliderModule,
    MatStepperModule,
    ReactiveFormsModule,
    AuthHeaderComponent,
    RegistrationQuestionHeaderComponent,
  ],
  templateUrl: './date-preference.component.html',
  styleUrl: './date-preference.component.scss',
})
export class DatePreferenceComponent implements OnInit, OnDestroy {
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
    first_date_idea: [],
    date_activity_choice: [],
    important_date_aspect: [],
    date_formality_preference: [],
    date_attire: [],
  };

  public optionList: Record<string, IOption[] | []> = {
    first_date_idea: [],
    date_activity_choice: [],
    important_date_aspect: [],
    date_formality_preference: [],
    date_attire: [],
  };

  public selectedValue: Record<string, string[]> = {
    first_date_idea: [],
    date_activity_choice: [],
    important_date_aspect: [],
    date_formality_preference: [],
    date_attire: [],
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
              if (this.regQuestionList[i].questionnaire_type_id === 7) {
                const questions = this.regQuestionList[i].questions;
                this.questionLength = questions.length;
                this.questionListObject = this.regQuestionList[i].questionnaire_type;
                for (let j = 0; j < questions.length; j++) {
                  switch (questions[j].q_id) {
                    case 50: {
                      this.optionList['first_date_idea'] = questions[j].options;
                      break;
                    }
                    case 51: {
                      this.optionList['date_activity_choice'] = questions[j].options;
                      break;
                    }
                    case 52: {
                      this.optionList['important_date_aspect'] = questions[j].options;
                      break;
                    }
                    case 53: {
                      this.optionList['date_formality_preference'] = questions[j].options;
                      break;
                    }
                    case 54: {
                      this.optionList['date_attire'] = questions[j].options;
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
      this._store.dispatch(new GetRegQuestions({ questionnaire_type_id: 7 })).subscribe()
    );
  }

  initializeQuestionFrom() {
    this.questionForm = this.fb.group({
      first_date_idea: this.fb.array(
        this.optionList['first_date_idea'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      date_activity_choice: this.fb.array(
        this.optionList['date_activity_choice'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      important_date_aspect: this.fb.array(
        this.optionList['important_date_aspect'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      date_formality_preference: this.fb.array(
        this.optionList['date_formality_preference'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      date_attire: this.fb.array(
        this.optionList['date_attire'].map(() => false) // Initialize all checkboxes as unchecked
      ),
    });
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
  goToPreviousStep() {
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
      case 50:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 51:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 52:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 53:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 54:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;

      default:
        // handle default
        break;
    }
  }

  saveAnswer() {
    if (!this.isDisabled) {
      if (this.questionForm.valid) {
        this.isDisabled = true;
        const param = {
          answers_data: [
            {
              questionnaire_id: 7,
              answers: [
                {
                  q_id: 50,
                  field_name: 'first_date_idea',
                  sel_opt_id: this.selectedId['first_date_idea'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['first_date_idea'],
                },
                {
                  q_id: 51,
                  field_name: 'date_activity_choice',
                  sel_opt_id: this.selectedId['date_activity_choice'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['date_activity_choice'],
                },
                {
                  q_id: 52,
                  field_name: 'important_date_aspect',
                  sel_opt_id: this.selectedId['important_date_aspect'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['important_date_aspect'],
                },
                {
                  q_id: 53,
                  field_name: 'date_formality_preference',
                  sel_opt_id: this.selectedId['date_formality_preference'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['date_formality_preference'],
                },
                {
                  q_id: 54,
                  field_name: 'date_attire',
                  sel_opt_id: this.selectedId['date_attire'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['date_attire'],
                },
              ],
            },
          ],
        };
        this.subscriptions.push(
          this._store.dispatch(new SaveAllAnswer(param)).subscribe({
            next: () => {
              this.isDisabled = false;
              this._router.navigate(['/date-preference/complete']);
            },
            error: apiError => {
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
