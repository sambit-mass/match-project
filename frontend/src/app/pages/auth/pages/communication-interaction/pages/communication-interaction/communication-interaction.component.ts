import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { appSettings } from '@app/config';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { GetRegQuestions, RegistrationState, SaveAllAnswer } from '@app/store';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthHeaderComponent } from '@app/core/layouts/auth';
import { RegistrationQuestionHeaderComponent } from '@app/shared/components/registration-question-header/registration-question-header.component';
@Component({
  selector: 'app-communication-interaction',
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
  templateUrl: './communication-interaction.component.html',
  styleUrl: './communication-interaction.component.scss',
})
export class CommunicationInteractionComponent implements OnInit, OnDestroy {
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
    social_media_usage: [],
    communication_preference: [],
    emotional_openness: [],
    intellectual_conversation_interest: [],
    conversation_preference: [],
  };

  public optionList: Record<string, IOption[] | []> = {
    social_media_usage: [],
    communication_preference: [],
    emotional_openness: [],
    intellectual_conversation_interest: [],
    conversation_preference: [],
  };

  public selectedValue: Record<string, string[]> = {
    social_media_usage: [],
    communication_preference: [],
    emotional_openness: [],
    intellectual_conversation_interest: [],
    conversation_preference: [],
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
              if (this.regQuestionList[i].questionnaire_type_id === 8) {
                const questions = this.regQuestionList[i].questions;
                this.questionLength = questions.length;
                this.questionListObject = this.regQuestionList[i].questionnaire_type;
                for (let j = 0; j < questions.length; j++) {
                  switch (questions[j].q_id) {
                    case 55: {
                      this.optionList['social_media_usage'] = questions[j].options;
                      break;
                    }
                    case 56: {
                      this.optionList['communication_preference'] = questions[j].options;
                      break;
                    }
                    case 57: {
                      this.optionList['emotional_openness'] = questions[j].options;
                      break;
                    }
                    case 58: {
                      this.optionList['intellectual_conversation_interest'] = questions[j].options;
                      break;
                    }
                    case 59: {
                      this.optionList['conversation_preference'] = questions[j].options;
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
      this._store.dispatch(new GetRegQuestions({ questionnaire_type_id: 8 })).subscribe()
    );
  }

  initializeQuestionFrom() {
    this.questionForm = this.fb.group({
      social_media_usage: this.fb.array(
        this.optionList['social_media_usage'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      communication_preference: this.fb.array(
        this.optionList['communication_preference'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      emotional_openness: this.fb.array(
        this.optionList['emotional_openness'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      intellectual_conversation_interest: this.fb.array(
        this.optionList['intellectual_conversation_interest'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      conversation_preference: this.fb.array(
        this.optionList['conversation_preference'].map(() => false) // Initialize all checkboxes as unchecked
      ),
    });
  }

  getFormArray(control: string) {
    return this.questionForm.controls[control] as FormArray;
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
      case 55:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 56:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 57:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 58:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 59:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;

      default:
        // handle default
        break;
    }
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

  saveAnswer() {
    if (!this.isDisabled) {
      if (this.questionForm.valid) {
        this.isDisabled = true;
        const param = {
          answers_data: [
            {
              questionnaire_id: 8,
              answers: [
                {
                  q_id: 55,
                  field_name: 'social_media_usage',
                  sel_opt_id: this.selectedId['social_media_usage'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['social_media_usage'],
                },
                {
                  q_id: 56,
                  field_name: 'communication_preference',
                  sel_opt_id: this.selectedId['communication_preference'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['communication_preference'],
                },
                {
                  q_id: 57,
                  field_name: 'emotional_openness',
                  sel_opt_id: this.selectedId['emotional_openness'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['emotional_openness'],
                },
                {
                  q_id: 58,
                  field_name: 'intellectual_conversation_interest',
                  sel_opt_id: this.selectedId['intellectual_conversation_interest'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['intellectual_conversation_interest'],
                },
                {
                  q_id: 59,
                  field_name: 'conversation_preference',
                  sel_opt_id: this.selectedId['conversation_preference'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['conversation_preference'],
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
              this._router.navigate(['/communication-interaction/complete']);
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
