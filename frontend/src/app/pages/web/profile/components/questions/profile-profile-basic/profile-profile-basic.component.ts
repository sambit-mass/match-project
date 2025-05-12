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
import { RegistrationState } from '@app/store';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { Subscription, Observable, combineLatest } from 'rxjs';
import { ProfileState } from '@app/store/states/profile.state';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SaveAllAnswerFromProfile } from '@app/store/actions/profile.action';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-profile-profile-basic',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TranslatePipe,
    MatInputModule,
    MatSliderModule,
    ReactiveFormsModule,
  ],
  templateUrl: './profile-profile-basic.component.html',
  styleUrl: './profile-profile-basic.component.scss',
})
export class ProfileProfileBasicComponent implements OnInit, OnDestroy {
  max = 243;
  min = 100;
  thumbLabel = true;

  public submitted = false;
  public isDisabled = false;
  private selectAnswer: IAnswer[] = [];
  public questionForm!: FormGroup;
  public minRange: number = 0;
  public maxRange: number = 0;
  public language: string = 'chinese';
  @Output() closeDialog = new EventEmitter();
  public selectedId: Record<string, number[]> = {};
  public optionList: Record<string, IOption[] | []> = {};
  @Input() public activeQuestionerIdType!: { id: number; type: string };
  private isFirstTimeLoad = true;
  private _store = inject(Store);
  private subscriptions: Subscription[] = [];
  public regQuestionList: IQuestionnaire[] = [];
  public allQuestionId: number[] = [];
  public answerList: IAnswerList[] = [];
  public singleQuestionList: IQuestionAnswer[] = [];
  private regQuestionList$: Observable<IQuestionnaire[]> = this._store.select(
    RegistrationState.regQuestionList
  );
  private answerList$: Observable<IAnswerList[]> = this._store.select(ProfileState.getAnswerList);
  public questionListObject: ILanguageText = {
    en: '',
    zh: '',
  };

  constructor(
    private _fb: FormBuilder,
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
      combineLatest([this.regQuestionList$, this.answerList$]).subscribe({
        next: apiResult => {
          if (apiResult[0].length && apiResult[1].length) {
            this.regQuestionList = apiResult[0];
            this.answerList = apiResult[1];
            const requiredQuestion =
              this.regQuestionList[
                this.regQuestionList.findIndex(item => item.questionnaire_type_id === 2)
              ];
            const cloneQuestion = structuredClone(requiredQuestion);
            const requiredAnswer =
              this.answerList[this.answerList.findIndex(item => item.questionnaire_id === 2)];
            const cloneAnswer = structuredClone(requiredAnswer);

            const rangeTypeQue = requiredAnswer.answers.find(item => item.q_id === 10);
            if (rangeTypeQue && rangeTypeQue.sel_opt_id) {
              this.maxRange = rangeTypeQue.sel_opt_id[0];
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

          this.initializeQuestionFrom();
        },
      })
    );
    this.isFirstTimeLoad = false;
    this.allQuestionId = [
      this.activeQuestionerIdType.id,
      ...this.allQuestionId
        .filter(num => num !== this.activeQuestionerIdType.id)
        .sort((a, b) => a - b),
    ];
  }

  initializeQuestionFrom() {
    this.questionForm = this._fb.group({
      highest_education_level: this._fb.array(
        this.optionList['highest_education_level'].map(() => false)
      ),
      height: this._fb.control(this.maxRange),
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

  getFormArray(control: string) {
    return this.questionForm.controls[control] as FormArray;
  }

  goToNextStep(questionId: number, filedName: string, option?: IOption[], goNext = true) {
    const formValue = this.questionForm.getRawValue();
    if (questionId === 10) {
      this.selectAnswer.push({
        q_id: questionId,
        field_name: filedName,
        sel_opt_id: [formValue.height],
        sel_opt_text: '',
        field_value: [`${formValue.height}`],
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
              questionnaire_id: 2,
              answers: this.selectAnswer,
            },
          ],
        };
        this.subscriptions.push(
          this._store.dispatch(new SaveAllAnswerFromProfile(param)).subscribe({
            next: () => {
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
