import {
  FormGroup,
  FormsModule,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { PatchProfileDetails, RegistrationState } from '@app/store';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { Subscription, Observable, combineLatest } from 'rxjs';
import { ProfileState } from '@app/store/states/profile.state';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SaveAllAnswerFromProfile, UpdateProfile } from '@app/store/actions/profile.action';
import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-profie-partner-preference',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TranslatePipe,
    MatInputModule,
    MatSliderModule,
    ReactiveFormsModule,
  ],
  templateUrl: './profie-partner-preference.component.html',
  styleUrl: './profie-partner-preference.component.scss',
})
export class ProfiePartnerPreferenceComponent {
  max = 243;
  min = 100;
  value1 = 25;
  value2 = 30;
  thumbLabel = true;

  public submitted = false;
  public isDisabled = false;
  public questionForm!: FormGroup;
  public minRange: number = 0;
  public maxRange: number = 0;
  private selectAnswer: IAnswer[] = [];
  public selectedId: Record<string, number[]> = {};
  public optionList: Record<string, IOption[] | []> = {};
  private isFirstTimeLoad = true;
  private _store = inject(Store);
  public allQuestionId: number[] = [];
  public answerList: IAnswerList[] = [];
  private subscriptions: Subscription[] = [];
  public regQuestionList: IQuestionnaire[] = [];
  public singleQuestionList: IQuestionAnswer[] = [];
  private regQuestionList$: Observable<IQuestionnaire[]> = this._store.select(
    RegistrationState.regQuestionList
  );
  private answerList$: Observable<IAnswerList[]> = this._store.select(ProfileState.getAnswerList);
  public questionListObject: ILanguageText = {
    en: '',
    zh: '',
  };

  public language: string = 'chinese';
  @Output() closeDialog = new EventEmitter();
  @Input() public activeQuestionerIdType!: { id: number; type: string };
  private profileDetails$: Observable<IViewProfile | null> = this._store.select(
    RegistrationState.profileDetails
  );
  public profileDetails: IViewProfile | null = null;

  constructor(
    private fb: FormBuilder,
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
      combineLatest([this.regQuestionList$, this.answerList$, this.profileDetails$]).subscribe({
        next: apiResult => {
          if (apiResult[2] != null) {
            this.profileDetails = apiResult[2];
          }
          if (apiResult[0].length && apiResult[1].length) {
            this.regQuestionList = apiResult[0];
            this.answerList = apiResult[1];
            const requiredQuestion =
              this.regQuestionList[
                this.regQuestionList.findIndex(item => item.questionnaire_type_id === 1)
              ];
            const cloneQuestion = structuredClone(requiredQuestion);
            const requiredAnswer =
              this.answerList[this.answerList.findIndex(item => item.questionnaire_id === 1)];
            const cloneAnswer = structuredClone(requiredAnswer);
            if (this.activeQuestionerIdType.type === 'all') {
              cloneQuestion.questions.splice(0, 2);
              cloneAnswer.answers.splice(0, 2);
            } else {
              cloneQuestion.questions = [cloneQuestion.questions[0]];
              cloneAnswer.answers = [cloneAnswer.answers[0]];
            }
            /* dynamic range question*/
            const rangeTypeQue = requiredAnswer.answers.find(item => item.q_id === 4);
            if (rangeTypeQue && rangeTypeQue.sel_opt_id) {
              this.minRange = rangeTypeQue.sel_opt_id[0];
              this.maxRange = rangeTypeQue.sel_opt_id[1];
            }
            // ----------------------
            this.singleQuestionList = [];
            for (let i = 0; i < cloneQuestion.questions.length; i++) {
              if (cloneQuestion.questions[i].options.length) {
                this.optionList[cloneQuestion.questions[i].field_name] =
                  cloneQuestion.questions[i].options;
                this.selectedId[cloneQuestion.questions[i].field_name] =
                  cloneAnswer.answers[i]!.sel_opt_id;
              }
              if (this.isFirstTimeLoad) {
                if (this.activeQuestionerIdType.type === 'single') {
                  this.allQuestionId = [this.activeQuestionerIdType.id];
                } else {
                  this.allQuestionId.push(cloneQuestion.questions[i].q_id);
                }
              }

              this.singleQuestionList.push({
                ...cloneQuestion.questions[i],
                options: cloneQuestion.questions[i].options.map(option => {
                  if (cloneAnswer.answers[i]!.sel_opt_id?.includes(option.op_id)) {
                    return { ...option, selected: true };
                  } else {
                    return { ...option, selected: false };
                  }
                }),
              });
            }
          }

          this.allQuestionId = [
            this.activeQuestionerIdType.id,
            ...this.allQuestionId
              .filter(num => num !== this.activeQuestionerIdType.id)
              .sort((a, b) => a - b),
          ];
          this.isFirstTimeLoad = false;
          this.initializeQuestionFrom();
        },
      })
    );
  }

  initializeQuestionFrom() {
    if (this.activeQuestionerIdType.type === 'all') {
      this.questionForm = this.fb.group({
        preferred_location: this.fb.array(
          this.optionList['preferred_location'].map(() => false) // Initialize all checkboxes as unchecked
        ),
        preferred_height_from: new FormControl(this.minRange),
        preferred_height_to: new FormControl(this.maxRange),
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
    } else {
      this.questionForm = this.fb.group({
        seeking_for: this.fb.array(
          this.optionList['seeking_for'].map(() => false) // Initialize all checkboxes as unchecked
        ),
      });
    }
  }

  getFormArray(control: string) {
    return this.questionForm.controls[control] as FormArray;
  }

  goToNextStep(questionId: number, filedName: string, option?: IOption[], goNext = true) {
    const formValue = this.questionForm.getRawValue();
    if (questionId === 4) {
      this.selectAnswer.push({
        q_id: questionId,
        field_name: filedName,
        sel_opt_id: [formValue.preferred_height_from, formValue.preferred_height_to],
        sel_opt_text: '',
        field_value: [`${formValue.preferred_height_from}-${formValue.preferred_height_to}`],
      });
    } else {
      let fieldValue: string[] = [];
      if (option) {
        for (let i = 0; i < this.selectedId[filedName].length; i++) {
          const selectedOpId = this.selectedId[filedName][i];
          const displayValue = option.find(item => item.op_id === selectedOpId)?.en;
          if (displayValue) {
            fieldValue.push(displayValue);
          }
        }
      }
      this.selectAnswer.push({
        q_id: questionId,
        field_name: filedName,
        sel_opt_id: this.selectedId[filedName],
        sel_opt_text: '',
        field_value: fieldValue,
      });
    }

    if (!this.isDisabled) {
      this.submitted = true;
      if (this.questionForm.valid) {
        this.isDisabled = true;
        const param = {
          answers_data: [
            {
              questionnaire_id: 1,
              answers: this.selectAnswer,
            },
          ],
        };

        const qId = param.answers_data[0].answers[0].q_id;

        const actions = [];
        const gender = param.answers_data?.[0]?.answers?.[0]?.field_value?.[0]?.split(' ')?.[3];
        const genderCode = gender === 'man' ? 1 : gender === 'woman' ? 2 : 0;

        if (qId === 1) {
          actions.push(
            new SaveAllAnswerFromProfile(param),
            new UpdateProfile({ gender: genderCode })
          );
        } else {
          actions.push(new SaveAllAnswerFromProfile(param));
        }

        this.subscriptions.push(
          this._store.dispatch(actions).subscribe({
            next: () => {
              if (qId === 1) {
                if (this.profileDetails) {
                  this.profileDetails = {
                    ...this.profileDetails,
                    gender: genderCode,
                  };
                }
                this._store.dispatch(new PatchProfileDetails(this.profileDetails));
              }
              this.submitted = false;
              this.isDisabled = false;
              if (goNext) {
                this.allQuestionId.splice(0, 1);
                this.activeQuestionerIdType.id = this.allQuestionId[0];
              } else {
                this.closeDialog.emit();
              }
              this.selectAnswer = [];
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

  onclickAnswer(
    answerId: number,
    selectType: number,
    formType: string,
    qIndex: number,
    optionIndex: number,
    answer: string
  ) {
    if (selectType === 0 || answer === 'Prefer not to say') {
      for (let i = 0; i < this.optionList[formType].length; i++) {
        if (optionIndex !== i) this.getFormArray(formType).at(i).setValue(false);
      }
      this.selectedId[formType] = [answerId];
      const option = this.singleQuestionList[qIndex].options;
      option.forEach(item => {
        item.selected = item.op_id === answerId;
      });
    } else {
      if (this.selectedId[formType].includes(answerId)) {
        this.selectedId[formType].splice(this.selectedId[formType].indexOf(answerId), 1);
        const option = this.singleQuestionList[qIndex].options[optionIndex];
        this.singleQuestionList[qIndex].options[optionIndex] = {
          ...option,
          selected: false,
        };
      } else {
        if (this.selectedId[formType].length >= 4) {
          return;
        } else {
          const notToSayIndex = this.singleQuestionList[qIndex].options.findIndex(
            item => item.en === 'Prefer not to say'
          );
          if (notToSayIndex !== -1) {
            const notToSayOption = this.singleQuestionList[qIndex].options[notToSayIndex];
            if (this.selectedId[formType].includes(notToSayOption.op_id)) {
              this.singleQuestionList[qIndex].options[notToSayIndex] = {
                ...notToSayOption,
                selected: false,
              };
              this.selectedId[formType].splice(
                this.selectedId[formType].indexOf(notToSayOption.op_id),
                1
              );
            }
          }
          const option = this.singleQuestionList[qIndex].options[optionIndex];
          this.singleQuestionList[qIndex].options[optionIndex] = {
            ...option,
            selected: true,
          };
          this.selectedId[formType].push(answerId);
        }
      }
    }
  }

  saveAnswer(questionId: number, filedName: string, option?: IOption[]) {
    this.goToNextStep(questionId, filedName, option, false);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
