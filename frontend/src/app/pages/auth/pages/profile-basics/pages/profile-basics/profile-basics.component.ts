import {
  FormArray,
  FormGroup,
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { appSettings } from '@app/config';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { fadeAnimation } from '@app/shared/animations';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { AuthHeaderComponent } from '@app/core/layouts/auth';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonService, EncryptionService } from '@app/core/services';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { GetRegQuestions, RegistrationState, SaveAllAnswer } from '@app/store';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RegistrationQuestionHeaderComponent } from '../../../../../../shared/components/registration-question-header/registration-question-header.component';

@Component({
  selector: 'app-profile-basics',
  standalone: true,
  imports: [
    AuthHeaderComponent,
    FormsModule,
    CommonModule,
    TranslatePipe,
    MatInputModule,
    MatSliderModule,
    MatStepperModule,
    ReactiveFormsModule,
    TranslatePipe,
    RegistrationQuestionHeaderComponent,
  ],
  templateUrl: './profile-basics.component.html',
  styleUrl: './profile-basics.component.scss',
  animations: [fadeAnimation],
})
export class ProfileBasicsComponent implements OnInit, OnDestroy {
  max = 250;
  min = 100;
  thumbLabel = true;
  public isDisabled = false;
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
  public language: string = 'chinese';
  questionForm!: FormGroup;
  public submitted = false;
  public selectedIndex = 0;

  public count: number = 1;
  public questionLength: number = 0;

  public selectedId: Record<string, number[]> = {
    highest_education_level: [],
    current_occupation: [],
    relationship_status: [],
    children_want: [],
    children_status: [],
    ethnicity: [],
    smoking_habit: [],
    alcohol_consumption: [],
    religion_importance: [],
    languages_spoken: [],
    self_body_type: [],
    self_religion: [],
  };

  public optionList: Record<string, IOption[] | []> = {
    highest_education_level: [],
    current_occupation: [],
    relationship_status: [],
    children_want: [],
    children_status: [],
    ethnicity: [],
    smoking_habit: [],
    alcohol_consumption: [],
    religion_importance: [],
    languages_spoken: [],
    self_body_type: [],
    self_religion: [],
  };

  public selectedValue: Record<string, string[]> = {
    highest_education_level: [],
    current_occupation: [],
    relationship_status: [],
    children_want: [],
    children_status: [],
    ethnicity: [],
    smoking_habit: [],
    alcohol_consumption: [],
    religion_importance: [],
    languages_spoken: [],
    self_body_type: [],
    self_religion: [],
  };

  @ViewChild('stepper') stepper!: MatStepper;

  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _toastr: ToastrService,
    private _translate: TranslateService
  ) {}

  ngOnInit(): void {
    // this.initQuestionForm();
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
              if (this.regQuestionList[i].questionnaire_type_id === 2) {
                const questions = this.regQuestionList[i].questions;

                this.questionLength = questions.length;
                this.questionListObject = this.regQuestionList[i].questionnaire_type;
                for (let j = 0; j < questions.length; j++) {
                  switch (questions[j].q_id) {
                    case 9: {
                      this.optionList['highest_education_level'] = questions[j].options;
                      break;
                    }
                    case 11: {
                      this.optionList['current_occupation'] = questions[j].options;
                      break;
                    }
                    case 12: {
                      this.optionList['relationship_status'] = questions[j].options;
                      break;
                    }
                    case 13: {
                      this.optionList['children_want'] = questions[j].options;
                      break;
                    }
                    case 14: {
                      this.optionList['children_status'] = questions[j].options;
                      break;
                    }
                    case 15: {
                      this.optionList['ethnicity'] = questions[j].options;
                      break;
                    }
                    case 16: {
                      this.optionList['smoking_habit'] = questions[j].options;
                      break;
                    }
                    case 17: {
                      this.optionList['alcohol_consumption'] = questions[j].options;
                      break;
                    }
                    case 18: {
                      this.optionList['religion_importance'] = questions[j].options;
                      break;
                    }
                    case 19: {
                      this.optionList['languages_spoken'] = questions[j].options;
                      break;
                    }
                    case 20: {
                      this.optionList['self_body_type'] = questions[j].options;
                      break;
                    }
                    case 21: {
                      this.optionList['self_religion'] = questions[j].options;
                      break;
                    }
                  }
                }
              } else {
                this.fetchRegQuestion();
              }
            }
            this.initQuestionForm();
          } else {
            this.fetchRegQuestion();
          }
        },
      })
    );
  }

  private fetchRegQuestion() {
    this.subscriptions.push(
      this._store.dispatch(new GetRegQuestions({ questionnaire_type_id: 2 })).subscribe()
    );
  }

  initQuestionForm() {
    this.questionForm = this._fb.group({
      highest_education_level: this._fb.array(
        this.optionList['highest_education_level'].map(() => false)
      ),
      height: this._fb.control(130),
      current_occupation: this._fb.array(this.optionList['current_occupation'].map(() => false)),
      relationship_status: this._fb.array(this.optionList['relationship_status'].map(() => false)),
      children_want: this._fb.array(this.optionList['children_want'].map(() => false)),
      children_status: this._fb.array(this.optionList['children_status'].map(() => false)),
      ethnicity: this._fb.array(this.optionList['ethnicity'].map(() => false)),
      smoking_habit: this._fb.array(this.optionList['smoking_habit'].map(() => false)),
      alcohol_consumption: this._fb.array(this.optionList['alcohol_consumption'].map(() => false)),
      religion_importance: this._fb.array(this.optionList['religion_importance'].map(() => false)),
      languages_spoken: this._fb.array(this.optionList['languages_spoken'].map(() => false)),
      self_body_type: this._fb.array(this.optionList['self_body_type'].map(() => false)),
      self_religion: this._fb.array(this.optionList['self_religion'].map(() => false)),
    });
  }

  public hasFormControlError(field: string): boolean {
    const control = this.questionForm.get(field) as FormControl;
    if (this.submitted && (control?.errors || control?.invalid)) {
      return true;
    }
    return false;
  }
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
      case 9:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 11:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 12:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 13:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 14:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 15:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 16:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 17:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 18:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 19:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 20:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 21:
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
              questionnaire_id: 2,
              answers: [
                {
                  q_id: 9,
                  field_name: 'highest_education_level',
                  sel_opt_id: this.selectedId['highest_education_level'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['highest_education_level'],
                },
                {
                  q_id: 10,
                  field_name: 'height',
                  sel_opt_id: [formValue.height],
                  sel_opt_text: '',
                  field_value: [`${formValue.height}`],
                },
                {
                  q_id: 11,
                  field_name: 'current_occupation',
                  sel_opt_id: this.selectedId['current_occupation'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['current_occupation'],
                },
                {
                  q_id: 12,
                  field_name: 'relationship_status',
                  sel_opt_id: this.selectedId['relationship_status'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['relationship_status'],
                },
                {
                  q_id: 13,
                  field_name: 'children_want',
                  sel_opt_id: this.selectedId['children_want'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['children_want'],
                },
                {
                  q_id: 14,
                  field_name: 'children_status',
                  sel_opt_id: this.selectedId['children_status'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['children_status'],
                },
                {
                  q_id: 15,
                  field_name: 'ethnicity',
                  sel_opt_id: this.selectedId['ethnicity'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['ethnicity'],
                },
                {
                  q_id: 16,
                  field_name: 'smoking_habit',
                  sel_opt_id: this.selectedId['smoking_habit'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['smoking_habit'],
                },
                {
                  q_id: 17,
                  field_name: 'alcohol_consumption',
                  sel_opt_id: this.selectedId['alcohol_consumption'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['alcohol_consumption'],
                },
                {
                  q_id: 18,
                  field_name: 'religion_importance',
                  sel_opt_id: this.selectedId['religion_importance'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['religion_importance'],
                },
                {
                  q_id: 19,
                  field_name: 'languages_spoken',
                  sel_opt_id: this.selectedId['languages_spoken'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['languages_spoken'],
                },
                {
                  q_id: 20,
                  field_name: 'self_body_type',
                  sel_opt_id: this.selectedId['self_body_type'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['self_body_type'],
                },
                {
                  q_id: 21,
                  field_name: 'self_religion',
                  sel_opt_id: this.selectedId['self_religion'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['self_religion'],
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
              this._router.navigate(['/profile-basics/complete']);
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
