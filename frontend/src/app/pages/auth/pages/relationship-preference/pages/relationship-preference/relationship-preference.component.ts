import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { appSettings } from '@app/config';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { AuthHeaderComponent } from '@app/core/layouts/auth';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { GetRegQuestions, RegistrationState, SaveAllAnswer } from '@app/store';
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
import { RegistrationQuestionHeaderComponent } from '../../../../../../shared/components/registration-question-header/registration-question-header.component';

@Component({
  selector: 'app-relationship-preference',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TranslatePipe,
    MatInputModule,
    MatSliderModule,
    MatStepperModule,
    AuthHeaderComponent,
    ReactiveFormsModule,
    RegistrationQuestionHeaderComponent,
  ],
  templateUrl: './relationship-preference.component.html',
  styleUrl: './relationship-preference.component.scss',
})
export class RelationshipPreferenceComponent implements OnInit, OnDestroy {
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
  private credentials: string = appSettings.credentialsKey;

  public questionForm!: FormGroup;

  public selectedId: Record<string, number[]> = {
    partner_preferences: [],
    important_traits_partner: [],
    communication_importance: [],
    disagreement_handling: [],
    strong_relationship_values: [],
    long_distance_relationship: [],
    future_with_partner: [],
  };

  public optionList: Record<string, IOption[] | []> = {
    partner_preferences: [],
    important_traits_partner: [],
    communication_importance: [],
    disagreement_handling: [],
    strong_relationship_values: [],
    long_distance_relationship: [],
    future_with_partner: [],
  };

  public selectedValue: Record<string, string[]> = {
    partner_preferences: [],
    important_traits_partner: [],
    communication_importance: [],
    disagreement_handling: [],
    strong_relationship_values: [],
    long_distance_relationship: [],
    future_with_partner: [],
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
              if (this.regQuestionList[i].questionnaire_type_id === 6) {
                const questions = this.regQuestionList[i].questions;
                this.questionLength = questions.length;
                this.questionListObject = this.regQuestionList[i].questionnaire_type;
                for (let j = 0; j < questions.length; j++) {
                  switch (questions[j].q_id) {
                    case 43: {
                      this.optionList['partner_preferences'] = questions[j].options;
                      break;
                    }
                    case 44: {
                      this.optionList['important_traits_partner'] = questions[j].options;
                      break;
                    }
                    case 45: {
                      this.optionList['communication_importance'] = questions[j].options;
                      break;
                    }
                    case 46: {
                      this.optionList['disagreement_handling'] = questions[j].options;
                      break;
                    }
                    case 47: {
                      this.optionList['strong_relationship_values'] = questions[j].options;
                      break;
                    }
                    case 48: {
                      this.optionList['long_distance_relationship'] = questions[j].options;
                      break;
                    }
                    case 49: {
                      this.optionList['future_with_partner'] = questions[j].options;
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
      this._store.dispatch(new GetRegQuestions({ questionnaire_type_id: 6 })).subscribe()
    );
  }

  initializeQuestionFrom() {
    this.questionForm = this.fb.group({
      partner_preferences: this.fb.array(
        this.optionList['partner_preferences'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      important_traits_partner: this.fb.array(
        this.optionList['important_traits_partner'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      communication_importance: this.fb.array(
        this.optionList['communication_importance'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      disagreement_handling: this.fb.array(
        this.optionList['disagreement_handling'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      strong_relationship_values: this.fb.array(
        this.optionList['strong_relationship_values'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      long_distance_relationship: this.fb.array(
        this.optionList['long_distance_relationship'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      future_with_partner: this.fb.array(
        this.optionList['future_with_partner'].map(() => false) // Initialize all checkboxes as unchecked
      ),
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
      case 43:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 44:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 45:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 46:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 47:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 48:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 49:
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
              questionnaire_id: 6,
              answers: [
                {
                  q_id: 43,
                  field_name: 'partner_preferences',
                  sel_opt_id: this.selectedId['partner_preferences'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['partner_preferences'],
                },
                {
                  q_id: 44,
                  field_name: 'important_traits_partner',
                  sel_opt_id: this.selectedId['important_traits_partner'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['important_traits_partner'],
                },
                {
                  q_id: 45,
                  field_name: 'communication_importance',
                  sel_opt_id: this.selectedId['communication_importance'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['communication_importance'],
                },
                {
                  q_id: 46,
                  field_name: 'disagreement_handling',
                  sel_opt_id: this.selectedId['disagreement_handling'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['disagreement_handling'],
                },
                {
                  q_id: 47,
                  field_name: 'strong_relationship_values',
                  sel_opt_id: this.selectedId['strong_relationship_values'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['strong_relationship_values'],
                },
                {
                  q_id: 48,
                  field_name: 'long_distance_relationship',
                  sel_opt_id: this.selectedId['long_distance_relationship'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['long_distance_relationship'],
                },
                {
                  q_id: 49,
                  field_name: 'future_with_partner',
                  sel_opt_id: this.selectedId['future_with_partner'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['future_with_partner'],
                },
              ],
            },
          ],
        };

        this.subscriptions.push(
          this._store.dispatch(new SaveAllAnswer(param)).subscribe({
            next: () => {
              this.isDisabled = false;
              this._router.navigate(['/relationship-preference/complete']);
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
