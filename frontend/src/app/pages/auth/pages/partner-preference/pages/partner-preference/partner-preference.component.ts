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
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { fadeAnimation } from '@app/shared/animations';
import { TranslateService } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { AuthHeaderComponent } from '@app/core/layouts/auth';
import { EncryptionService } from '@app/core/services';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { GetRegQuestions, RegistrationState, SaveAllAnswer } from '@app/store';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RegistrationQuestionHeaderComponent } from '../../../../../../shared/components/registration-question-header/registration-question-header.component';

@Component({
  selector: 'app-partner-preference',
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
  animations: [fadeAnimation],
  templateUrl: './partner-preference.component.html',
  styleUrl: './partner-preference.component.scss',
})
export class PartnerPreferenceComponent implements OnInit, OnDestroy {
  max = 250;
  min = 100;
  value1 = 25;
  value2 = 30;
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
    preferred_location: [],
    preferred_body_type: [],
    preferred_children_have: [],
    preferred_children_want: [],
    preferred_religion: [],
  };

  public optionList: Record<string, IOption[] | []> = {
    preferred_location: [],
    preferred_body_type: [],
    preferred_children_have: [],
    preferred_children_want: [],
    preferred_religion: [],
  };

  public selectedValue: Record<string, string[]> = {
    preferred_location: [],
    preferred_body_type: [],
    preferred_children_have: [],
    preferred_children_want: [],
    preferred_religion: [],
  };
  public language: string = 'chinese';
  @ViewChild('stepper') stepper!: MatStepper;

  public count: number = 1;
  public questionLength: number = 0;
  private preferedHeightFromValue: number = 0;

  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _encryptionService: EncryptionService,
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
              if (this.regQuestionList[i].questionnaire_type_id === 1) {
                const questions = this.regQuestionList[i].questions;
                this.questionLength = questions.length - 2;
                this.questionListObject = this.regQuestionList[i].questionnaire_type;
                for (let j = 0; j < questions.length; j++) {
                  switch (questions[j].q_id) {
                    case 3: {
                      this.optionList['preferred_location'] = questions[j].options;
                      break;
                    }
                    case 5: {
                      this.optionList['preferred_body_type'] = questions[j].options;
                      break;
                    }
                    case 6: {
                      this.optionList['preferred_children_have'] = questions[j].options;
                      break;
                    }
                    case 7: {
                      this.optionList['preferred_children_want'] = questions[j].options;
                      break;
                    }
                    case 8: {
                      this.optionList['preferred_religion'] = questions[j].options;
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
      this._store.dispatch(new GetRegQuestions({ questionnaire_type_id: 1 })).subscribe()
    );
  }

  initializeQuestionFrom() {
    this.questionForm = this.fb.group({
      preferred_location: this.fb.array(
        this.optionList['preferred_location'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      preferred_height_from: new FormControl(120),
      preferred_height_to: new FormControl(165),
      preferred_body_type: this.fb.array(
        this.optionList['preferred_body_type'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      preferred_children_have: this.fb.array(
        this.optionList['preferred_children_have'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      preferred_children_want: this.fb.array(
        this.optionList['preferred_children_want'].map(() => false) // Initialize all checkboxes as unchecked
      ),
      preferred_religion: this.fb.array(
        this.optionList['preferred_religion'].map(() => false) // Initialize all checkboxes as unchecked
      ),
    });
    this.preferedHeightFromValue = this.questionForm.controls['preferred_height_from'].value;
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

  onSliderChange() {
    const heightFrom = this.questionForm.controls['preferred_height_from'].value;
    const heightTo = this.questionForm.controls['preferred_height_to'].value;
    if (heightTo - heightFrom < 10) {
      if (heightFrom !== this.preferedHeightFromValue) {
        this.questionForm.controls['preferred_height_from'].setValue(heightTo - 10);
      } else {
        this.questionForm.controls['preferred_height_to'].setValue(heightFrom + 10);
      }
    }
    this.preferedHeightFromValue = this.questionForm.controls['preferred_height_from'].value;
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
      case 3:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 5:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 6:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 7:
        this.getAnswer(answerId, selectType, isChecked, answer, formType, index);
        break;
      case 8:
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
              questionnaire_id: 1,
              answers: [
                {
                  q_id: 3,
                  field_name: 'preferred_location',
                  sel_opt_id: this.selectedId['preferred_location'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['preferred_location'],
                },
                {
                  q_id: 4,
                  field_name: 'preferred_height (cm)',
                  sel_opt_id: [formValue.preferred_height_from, formValue.preferred_height_to],
                  sel_opt_text: '',
                  field_value: [
                    `${formValue.preferred_height_from}-${formValue.preferred_height_to}`,
                  ],
                },
                {
                  q_id: 5,
                  field_name: 'preferred_body_type',
                  sel_opt_id: this.selectedId['preferred_body_type'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['preferred_body_type'],
                },
                {
                  q_id: 6,
                  field_name: 'preferred_children_have',
                  sel_opt_id: this.selectedId['preferred_children_have'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['preferred_children_have'],
                },
                {
                  q_id: 7,
                  field_name: 'preferred_children_want',
                  sel_opt_id: this.selectedId['preferred_children_want'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['preferred_children_want'],
                },
                {
                  q_id: 8,
                  field_name: 'preferred_religion',
                  sel_opt_id: this.selectedId['preferred_religion'],
                  sel_opt_text: '',
                  field_value: this.selectedValue['preferred_religion'],
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
              this._router.navigate(['/partner-preference/complete']);
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
