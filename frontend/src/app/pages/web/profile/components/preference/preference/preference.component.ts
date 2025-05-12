import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from '@app/core/services';
import { RegistrationState } from '@app/store';
import { ProfileState } from '@app/store/states/profile.state';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Subscription, Observable, combineLatest } from 'rxjs';

@Component({
  selector: 'app-preference',
  standalone: true,
  imports: [],
  templateUrl: './preference.component.html',
  styleUrl: './preference.component.scss',
})
export class PreferenceComponent implements OnInit {
  public selectedGender!: ILanguageText;
  private _store = inject(Store);
  public activeQuestionId!: number;
  private dialog = inject(MatDialog);
  public language: string = 'english';
  public selectAnswer: IAnswer[] = [];
  public answerList: IAnswerList[] = [];
  public subscriptions: Subscription[] = [];
  public regQuestionList: IQuestionnaire[] = [];
  public showQuestionList: IQuestionAnswer[] = [];

  public questionDialogRef!: MatDialogRef<string, any>;
  public introductionDialogRef!: MatDialogRef<string, any>;
  /**
   * 'activeQuestionIdType' variable contains first question id which is show first
   * select question in dialog box and 'type' use for control how many question i want to show
   */
  public activeQuestionIdType!: { id: number; type: string };
  public profileDetails: IViewProfile | null = null;
  @ViewChild('questionDialog') questionDialog!: TemplateRef<string>;
  @ViewChild('introductionDialog') introductionDialog!: TemplateRef<string>;
  private regQuestionList$: Observable<IQuestionnaire[]> = this._store.select(
    RegistrationState.regQuestionList
  );
  public questionnaireTypeId!: number;
  public editProfileTypeId!: number;
  public partnerPreferenceArrangeData: IQuestionAnswer[] = [];
  private lifeStyleShow = [
    { qId: 22, url: '/scss/icons.svg#icon-cooking' },
    { qId: 23, url: '/scss/icons.svg#icon-exercise' },
    { qId: 24, url: '/scss/icons.svg#icon-living' },
    { qId: 25, url: '/scss/icons.svg#icon-mealtime' },
    { qId: 26, url: '/scss/icons.svg#icon-diet' },
    { qId: 27, url: '/scss/icons.svg#icon-animal' },
    { qId: 28, url: '/scss/icons.svg#icon-weekend' },
  ];
  public lifestyleQuestionAnswerList: IQuestionAnswer[] = [];

  private relationshipPreference = [
    { qId: 43, url: '/scss/icons.svg#icon-relation' },
    { qId: 44, url: '/scss/icons.svg#icon-sense-of-humor' },
    { qId: 45, url: '/scss/icons.svg#icon-communication' },
    { qId: 46, url: '' },
    { qId: 47, url: '/scss/icons.svg#icon-strong-relation' },
    { qId: 48, url: '/scss/icons.svg#icon-distance-relation' },
    { qId: 49, url: '/scss/icons.svg#icon-future-partner' },
  ];
  public relationshipPreferenceArrangeData: IQuestionAnswer[] = [];

  private datePreference = [
    { qId: 50, url: '/scss/icons.svg#icon-first-date' },
    { qId: 51, url: '/scss/icons.svg#icon-date-activity' },
    { qId: 52, url: '/scss/icons.svg#icon-comfort-date' },
    { qId: 53, url: '/scss/icons.svg#icon-dresscode' },
    { qId: 54, url: '/scss/icons.svg#icon-dress' },
  ];
  public datePreferenceArrangeData: IQuestionAnswer[] = [];

  /**
   * This 'sendQuestion' is call about component to profile component for update category menu
   * active selection
   */
  @Output() sendQuestion = new EventEmitter<number>();
  private answerList$: Observable<IAnswerList[]> = this._store.select(ProfileState.getAnswerList);
  public city_zipcode: string = '';
  private profileDetails$: Observable<IViewProfile | null> = this._store.select(
    RegistrationState.profileDetails
  );
  public isProfileDialogOpen: boolean = false;

  constructor(
    private _commonService: CommonService,
    private _translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.language = this._translate.currentLang === 'zh' ? 'chinese' : 'english';
    this.subscriptions.push(
      this._translate.onLangChange.subscribe(event => {
        this.language = event.lang === 'zh' ? 'chinese' : 'english';
      })
    );
    this.getQuestionAnswerFromStore();
  }

  private getQuestionAnswerFromStore() {
    this.subscriptions.push(
      combineLatest([this.regQuestionList$, this.answerList$]).subscribe({
        next: apiResult => {
          if (apiResult[0].length && apiResult[1].length) {
            this.regQuestionList = apiResult[0];
            this.answerList = apiResult[1];
            this.arrangeQuestionAnswer(1);
            this.arrangeQuestionAnswer(3);
            this.arrangeQuestionAnswer(6);
            this.arrangeQuestionAnswer(7);
          }
        },
      })
    );
  }

  //Arrange question list for perticular questioner_id type of question list
  arrangeQuestionAnswer(questionerId: number) {
    const requiredQuestion =
      this.regQuestionList[
        this.regQuestionList.findIndex(item => item.questionnaire_type_id === questionerId)
      ];
    const cloneQuestion = structuredClone(requiredQuestion);

    const requiredAnswer =
      this.answerList[this.answerList.findIndex(item => item.questionnaire_id === questionerId)];
    const cloneAnswer = structuredClone(requiredAnswer);
    switch (questionerId) {
      case 3: {
        this.lifestyleQuestionAnswerList = [];
        break;
      }
      case 6: {
        this.relationshipPreferenceArrangeData = [];
        break;
      }
      case 1: {
        this.partnerPreferenceArrangeData = [];
        break;
      }
      case 7: {
        this.datePreferenceArrangeData = [];
        break;
      }
    }
    for (let i = 0; i < cloneAnswer?.answers.length; i++) {
      let arrangeOption: string = '';
      let selectedOption: IOption[] = [];
      if (!cloneQuestion.questions[i]?.options.length) {
        arrangeOption = cloneAnswer.answers[i]!.sel_opt_id.join('-');
      } else {
        selectedOption = cloneQuestion.questions[i]?.options.filter(option =>
          cloneAnswer.answers[i]!.sel_opt_id?.includes(option.op_id)
        );
      }
      switch (questionerId) {
        case 3: {
          this.lifestyleQuestionAnswerList.push({
            ...cloneQuestion.questions[i],
            options: selectedOption,
            answerText: this.getAnswer(selectedOption),
            optionText: arrangeOption,
            questionnaireTypeId: cloneQuestion.questionnaire_type_id,
            questionnaireType: cloneQuestion.questionnaire_type,
            url: this.lifeStyleShow.find(item => item.qId === cloneAnswer?.answers[i].q_id)?.url,
          });
          break;
        }
        case 6: {
          this.relationshipPreferenceArrangeData.push({
            ...cloneQuestion.questions[i],
            options: selectedOption,
            answerText: this.getAnswer(selectedOption),
            optionText: arrangeOption,
            questionnaireTypeId: cloneQuestion.questionnaire_type_id,
            questionnaireType: cloneQuestion.questionnaire_type,
            url: this.relationshipPreference.find(item => item.qId === cloneAnswer?.answers[i].q_id)
              ?.url,
          });
          break;
        }
        case 1: {
          this.partnerPreferenceArrangeData.push({
            ...cloneQuestion.questions[i],
            options: selectedOption,
            answerText: this.getAnswer(selectedOption),
            optionText: arrangeOption,
            questionnaireTypeId: cloneQuestion.questionnaire_type_id,
            questionnaireType: cloneQuestion.questionnaire_type,
          });
          break;
        }
        case 7: {
          this.datePreferenceArrangeData.push({
            ...cloneQuestion.questions[i],
            options: selectedOption,
            answerText: this.getAnswer(selectedOption),
            optionText: arrangeOption,
            questionnaireTypeId: cloneQuestion.questionnaire_type_id,
            questionnaireType: cloneQuestion.questionnaire_type,
            url: this.datePreference.find(item => item.qId === cloneAnswer?.answers[i].q_id)?.url,
          });
          break;
        }
      }
    }
  }

  getAnswer(options: IOption[]) {
    let enTextArr: string[] = [];
    let zhTextArr: string[] = [];
    for (let i = 0; i < options.length; i++) {
      enTextArr.push(options[i].en);
      zhTextArr.push(options[i].zh);
    }
    return { en: enTextArr.join(', '), zh: zhTextArr.join(', ') };
  }
}
