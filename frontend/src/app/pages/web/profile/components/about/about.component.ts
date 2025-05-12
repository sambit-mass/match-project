import {
  Input,
  inject,
  OnInit,
  Output,
  Component,
  ViewChild,
  OnDestroy,
  TemplateRef,
  EventEmitter,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { RegistrationState } from '@app/store';
import { CommonService } from '@app/core/services';
import { ProfileState } from '@app/store/states/profile.state';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ProgressSpinnerMode, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IntroductionDialogComponent } from '../introduction-dialog/introduction-dialog.component';
import { ProfiePartnerPreferenceComponent } from '../questions/profie-partner-preference/profie-partner-preference.component';
import { ProfileProfileBasicComponent } from '../questions/profile-profile-basic/profile-profile-basic.component';
import { ProfileValueAndBeliefsComponent } from '../questions/profile-value-and-beliefs/profile-value-and-beliefs.component';
import { ProfileCommunicationInteractionComponent } from '../questions/profile-communication-interaction/profile-communication-interaction.component';
import { ProfileFutureAspirationComponent } from '../questions/profile-future-aspiration/profile-future-aspiration.component';
import { ProfileLifestylePreferenceComponent } from '../questions/profile-lifestyle-preference/profile-lifestyle-preference.component';
import { ProfilePersonalityInterestComponent } from '../questions/profile-personality-interest/profile-personality-interest.component';
import { ProfileRelationshipPreferenceComponent } from '../questions/profile-relationship-preference/profile-relationship-preference.component';
import { ProfileDatingPreferenceComponent } from '../questions/profile-dating-preference/profile-dating-preference.component';
import { EditProfileComponent } from '../questions/edit-profile/edit-profile.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    TranslatePipe,
    MatDialogModule,
    CommonModule,
    MatProgressSpinnerModule,
    IntroductionDialogComponent,
    ProfiePartnerPreferenceComponent,
    ProfileProfileBasicComponent,
    ProfileValueAndBeliefsComponent,
    ProfileCommunicationInteractionComponent,
    ProfileFutureAspirationComponent,
    ProfileLifestylePreferenceComponent,
    ProfilePersonalityInterestComponent,
    ProfileRelationshipPreferenceComponent,
    ProfileDatingPreferenceComponent,
    EditProfileComponent,
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit, OnDestroy {
  public completePercent!: number;
  spinnerDiameter = 150;
  public selectedGender!: ILanguageText;
  private _store = inject(Store);
  public activeQuestionId!: number;
  private dialog = inject(MatDialog);
  public language: string = 'english';
  public selectAnswer: IAnswer[] = [];
  public answerList: IAnswerList[] = [];
  mode: ProgressSpinnerMode = 'determinate';
  public subscriptions: Subscription[] = [];
  public regQuestionList: IQuestionnaire[] = [];
  public showQuestionList: IQuestionAnswer[] = [];
  public singleQuestionList: IQuestionAnswer[] = [];
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

  /**
   * when left side category list selection changed then this setter is call from profile
   * and with this new question answer is arranged with 'arrangeQuestionAnswer' function
   */
  @Input() set setQuestionnaireTypeId(id: number) {
    console.log(id);

    this.questionnaireTypeId = id;
    this.arrangeQuestionAnswer(this.questionnaireTypeId);
  }

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

  /**
   * This is static data for first time question answer show
   */
  private showingQuestionId = [
    { questionnaireTypeId: 2, qId: 11 },
    { questionnaireTypeId: 2, qId: 15 },
    { questionnaireTypeId: 3, qId: 24 },
    { questionnaireTypeId: 4, qId: 29 },
    { questionnaireTypeId: 4, qId: 33 },
    { questionnaireTypeId: 5, qId: 41 },
    { questionnaireTypeId: 8, qId: 56 },
    { questionnaireTypeId: 9, qId: 61 },
  ];

  public factfileViewArr: IFactfileList[] = [];

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
      combineLatest([this.regQuestionList$, this.answerList$, this.profileDetails$]).subscribe({
        next: apiResult => {
          if (apiResult[0].length && apiResult[1].length && apiResult[2]) {
            this.regQuestionList = apiResult[0];
            this.answerList = apiResult[1];
            this.profileDetails = apiResult[2];
            /**
             * this is for PROFILE COMPLETENESS percentage show
             */
            this.completePercent = Number(
              this.profileDetails.profile_completeness.slice(
                0,
                this.profileDetails.profile_completeness.length - 1
              )
            );
            this.factfileShow();
            if (!this.questionnaireTypeId) {
              /**
               * Arrange question list for first time when user not choose any option
               * so that time 'questionnaireTypeId' undefined
               */
              this.showQuestionList = [];
              this.showingQuestionId.forEach(item => {
                let selectAns: IAnswer | undefined;
                //  Find the answer once, then break
                for (const singleAnswer of this.answerList) {
                  selectAns = singleAnswer.answers.find(answer => answer.q_id === item.qId);
                  if (selectAns) break;
                }
                if (selectAns) {
                  this.regQuestionList.forEach(questionSet => {
                    const question = questionSet.questions.find(
                      singleQuestion => singleQuestion.q_id === item.qId
                    );
                    if (question) {
                      this.showQuestionList.push({
                        ...question,
                        options: question.options.filter(option =>
                          selectAns!.sel_opt_id?.includes(option.op_id)
                        ),
                        questionnaireTypeId: questionSet.questionnaire_type_id,
                        questionnaireType: questionSet.questionnaire_type,
                      });
                    }
                  });
                }
              });
            } else {
              this.arrangeQuestionAnswer(this.questionnaireTypeId);
            }
          }
        },
      })
    );
  }

  /**
   * this function for factfile data arrange which have question before registration
   * @param questionerId
   * @param questionId
   * @returns
   */
  getFactfileAnswer(questionerId: number, questionId: number) {
    //let selectAns: IAnswer | undefined;
    //  Find the answer once, then break
    const answerIndex = this.answerList.findIndex(item => item.questionnaire_id === questionerId);
    const selectAns = this.answerList[answerIndex]?.answers.find(
      answer => answer.q_id === questionId
    )?.sel_opt_id;

    const selectQuestion =
      this.regQuestionList[
        this.regQuestionList.findIndex(item => item.questionnaire_type_id === questionerId)
      ];
    const requiredOption = selectQuestion?.questions.find(
      question => question.q_id === questionId
    )?.options;
    let enTextArr: string[] = [];
    let zhTextArr: string[] = [];
    if (selectAns && requiredOption) {
      for (let i = 0; i < selectAns.length; i++) {
        const answer = requiredOption.find(item => item.op_id === selectAns[i]);
        if (answer) {
          enTextArr.push(answer.en);
          zhTextArr.push(answer.zh);
        }
      }
    }
    return { en: enTextArr.join(', '), zh: zhTextArr.join(', ') };
  }

  /**
   * this function for factfile 'gender','city','political','university' data arrange
   * @param type
   * @returns
   */
  getProfileDetailsForFactfile(type: string): Record<string, string> {
    switch (type) {
      case 'gender': {
        switch (this.profileDetails?.gender) {
          case 0: {
            return { en: 'Non-binary', zh: '非二元', onlyText: '' };
          }
          case 1: {
            return { en: 'Man', zh: '男人', onlyText: '' };
          }
          case 2: {
            return { en: 'Woman', zh: '女士', onlyText: '' };
          }
          default: {
            return { en: '', zh: '', onlyText: '' };
          }
        }
      }
      case 'city': {
        if (this.profileDetails?.city && this.profileDetails?.zipcode) {
          return {
            en: '',
            zh: '',
            onlyText: `${this.profileDetails.city}, ${this.profileDetails.zipcode}`,
          };
        } else if (this.profileDetails?.zipcode) {
          return {
            en: '',
            zh: '',
            onlyText: `${this.profileDetails?.zipcode}`,
          };
        } else if (this.profileDetails?.city) {
          return {
            en: '',
            zh: '',
            onlyText: `${this.profileDetails?.city}`,
          };
        } else {
          return { en: 'Not Specified', zh: '未指定', onlyText: '' };
        }
      }
      case 'political': {
        if (this.profileDetails?.political_view) {
          return { en: '', zh: '', onlyText: `${this.profileDetails?.political_view}` };
        } else {
          return { en: 'Not Specified', zh: '未指定', onlyText: '' };
        }
      }
      case 'university': {
        if (this.profileDetails?.university) {
          return { en: '', zh: '', onlyText: `${this.profileDetails?.university}` };
        } else {
          return { en: 'Not Specified', zh: '未指定', onlyText: '' };
        }
      }
      default: {
        return { en: '', zh: '', onlyText: '' };
      }
    }
  }
  /**
   * This is call for factfile data arrange
   */
  factfileShow() {
    this.factfileViewArr = [
      {
        questionnaireTypeId: 10, //for city, zipcode edit dialog
        qId: 0,
        name: { en: 'City of residence', zh: '居住城市' },
        questionText: null,
        text: this.getProfileDetailsForFactfile('city'),
        logoUrl: '/scss/icons.svg#icon-location',
        showType: 'none',
      },
      {
        questionnaireTypeId: 1,
        qId: 1,
        name: { en: 'Gender', zh: '性别' },
        questionText: null,
        text: this.getProfileDetailsForFactfile('gender'),
        logoUrl: '/scss/icons.svg#icon-gender',
        showType: 'single',
      },
      {
        questionnaireTypeId: 2,
        qId: 11,
        name: { en: 'Occupation', zh: '职业' },
        questionText: this.getFactfileAnswer(2, 11),
        text: null,
        logoUrl: '/scss/icons.svg#icon-occupation',
        showType: 'all',
      },
      {
        questionnaireTypeId: 2,
        qId: 20,
        name: { en: 'Body Type', zh: '体型' },
        questionText: this.getFactfileAnswer(2, 20),
        text: null,
        logoUrl: '/scss/icons.svg#icon-body-type',
        showType: 'all',
      },
      {
        questionnaireTypeId: 2,
        qId: 15,
        name: { en: 'Ethnicity', zh: '种族' },
        questionText: this.getFactfileAnswer(2, 15),
        text: null,
        logoUrl: '/scss/icons.svg#icon-ethinticity',
        showType: 'all',
      },
      {
        questionnaireTypeId: 2,
        qId: 9,
        name: { en: 'Highest Degree', zh: '最高学位' },
        questionText: this.getFactfileAnswer(2, 9),
        text: null,
        logoUrl: '/scss/icons.svg#icon-degree',
        showType: 'all',
      },
      {
        questionnaireTypeId: 11, //for university edit dialog
        qId: 0,
        name: { en: 'University', zh: '大学' },
        questionText: null,
        text: this.getProfileDetailsForFactfile('university'),
        logoUrl: '/scss/icons.svg#icon-university',
        showType: 'none',
      },

      {
        questionnaireTypeId: 2,
        qId: 19,
        name: { en: 'Languages', zh: '语言' },
        questionText: this.getFactfileAnswer(2, 19),
        text: null,
        logoUrl: '/scss/icons.svg#icon-language',
        showType: 'all',
      },
      {
        questionnaireTypeId: 2,
        qId: 16,
        name: { en: 'Smoking Habits', zh: '吸烟习惯' },
        questionText: this.getFactfileAnswer(2, 16),
        text: null,
        logoUrl: '/scss/icons.svg#icon-smoking',
        showType: 'all',
      },
      {
        questionnaireTypeId: 2,
        qId: 17,
        name: { en: 'Drinking Habits', zh: '饮酒习惯' },
        questionText: this.getFactfileAnswer(2, 17),
        text: null,
        logoUrl: '/scss/icons.svg#icon-drink',
        showType: 'all',
      },
      {
        questionnaireTypeId: 3,
        qId: 23,
        name: { en: 'Workout Frequency', zh: '锻炼频率' },
        questionText: this.getFactfileAnswer(3, 23),
        text: null,
        logoUrl: '/scss/icons.svg#icon-workout',
        showType: 'all',
      },
      {
        questionnaireTypeId: 3,
        qId: 27,
        name: { en: 'Pet(s)', zh: '宠物' },
        questionText: this.getFactfileAnswer(3, 27),
        text: null,
        logoUrl: '/scss/icons.svg#icon-pet',
        showType: 'all',
      },
      {
        questionnaireTypeId: 2,
        qId: 12,
        name: { en: 'Marital Status', zh: '婚姻状况' },
        questionText: this.getFactfileAnswer(2, 12),
        text: null,
        logoUrl: '/scss/icons.svg#icon-marital-status',
        showType: 'all',
      },
      {
        questionnaireTypeId: 2,
        qId: 14,
        name: { en: 'Children', zh: '孩子们' },
        questionText: this.getFactfileAnswer(2, 14),
        text: null,
        logoUrl: '/scss/icons.svg#icon-children',
        showType: 'all',
      },
      {
        questionnaireTypeId: 2,
        qId: 13,
        name: { en: 'Wish for Children', zh: '为孩子们祈愿' },
        questionText: this.getFactfileAnswer(2, 13),
        text: null,
        logoUrl: '/scss/icons.svg#icon-wish',
        showType: 'all',
      },
      {
        questionnaireTypeId: 1,
        qId: 8,
        name: { en: 'Religion', zh: '宗教' },
        questionText: this.getFactfileAnswer(1, 8),
        text: null,
        logoUrl: '/scss/icons.svg#icon-relegion',
        showType: 'all',
      },
      {
        questionnaireTypeId: 12, //for Political View edit dialog
        qId: 0,
        name: { en: 'Political View', zh: '政治观点' },
        questionText: null,
        text: this.getProfileDetailsForFactfile('political'),
        logoUrl: '/scss/icons.svg#icon-political-view',
        showType: 'none',
      },
    ];
  }

  /**
   * When select any question from about component and 'questionnaireTypeId' is undefine
   * @param question
   */
  public selectQuestion(question: IQuestionAnswer) {
    this.sendQuestion.emit(question.questionnaireTypeId);
    this._commonService.setShowCategorySubmenu(true);
    this.activeQuestionIdType = { id: question.q_id, type: 'all' };
    if (
      !(
        question.questionnaireTypeId === 1 ||
        question.questionnaireTypeId === 3 ||
        question.questionnaireTypeId === 6 ||
        question.questionnaireTypeId === 7
      )
    ) {
      this.questionDialogRef = this.dialog.open(this.questionDialog, {
        panelClass: 'profile-question-dialog',
        hasBackdrop: true,
        disableClose: true,
      });
    }
  }

  //Arrange question list for perticular questioner_id type of question list
  arrangeQuestionAnswer(questionnaireId: number) {
    const requiredQuestion =
      this.regQuestionList[
        this.regQuestionList.findIndex(item => item.questionnaire_type_id === questionnaireId)
      ];
    const cloneQuestion = structuredClone(requiredQuestion);

    const requiredAnswer =
      this.answerList[this.answerList.findIndex(item => item.questionnaire_id === questionnaireId)];
    const cloneAnswer = structuredClone(requiredAnswer);
    if (questionnaireId === 1) {
      cloneQuestion.questions.splice(0, 2);
      cloneAnswer.answers.splice(0, 2);
    }
    this.singleQuestionList = [];
    for (let i = 0; i < cloneAnswer?.answers.length; i++) {
      let arrangeOption: string = '';
      if (!cloneQuestion.questions[i]?.options.length) {
        arrangeOption = cloneAnswer.answers[i]!.sel_opt_id.join('-');
      }
      this.singleQuestionList.push({
        ...cloneQuestion.questions[i],
        options: cloneQuestion.questions[i]?.options.filter(option =>
          cloneAnswer.answers[i]!.sel_opt_id?.includes(option.op_id)
        ),
        optionText: arrangeOption,
        questionnaireTypeId: cloneQuestion.questionnaire_type_id,
        questionnaireType: cloneQuestion.questionnaire_type,
      });
    }
    console.log(this.singleQuestionList);
  }

  /**
   * Open introduction dialog
   * @param event
   */
  openIntroductionDialog(event: Event) {
    event.stopPropagation();
    this.introductionDialogRef = this.dialog.open(this.introductionDialog, {
      panelClass: 'profile-common-dialog',
      hasBackdrop: true,
      disableClose: true,
    });
  }

  /**
   * close introduction dialog
   */
  closeIntroductionDialog() {
    this.introductionDialogRef.close();
  }

  /**
   * When select any question from about component and 'questionnaireTypeId' is selected
   * @param question
   */
  openQuestionDialog(event: Event, singleQuestion: IQuestionAnswer) {
    event.stopPropagation();
    this.activeQuestionIdType = { id: singleQuestion.q_id, type: 'all' };
    this.questionDialogRef = this.dialog.open(this.questionDialog, {
      panelClass: 'profile-question-dialog',
      hasBackdrop: true,
      disableClose: true,
    });
  }

  /**
   * open question answer dialog from factfile
   * @param event
   * @param singleQuestion
   */
  openFactfileQuestionDialog(event: Event, singleQuestion: IFactfileList) {
    event.stopPropagation();
    if (singleQuestion.showType === 'none') {
      this.editProfileTypeId = singleQuestion.questionnaireTypeId;
      this.isProfileDialogOpen = true;
    } else {
      this.sendQuestion.emit(singleQuestion.questionnaireTypeId);
      this._commonService.setShowCategorySubmenu(true);
      this.questionnaireTypeId = singleQuestion.questionnaireTypeId;
      this.activeQuestionIdType = { id: singleQuestion.qId, type: singleQuestion.showType };
    }
    this.questionDialogRef = this.dialog.open(this.questionDialog, {
      panelClass: 'profile-question-dialog',
      hasBackdrop: true,
      disableClose: true,
    });
  }

  /**
   * open question answer dialog from search category component through 'about' component reference
   * 'category search component==>profile component(By 'about' reference)<==about component
   * 'about', 'category Search' both are child of 'profile' component
   * @param data
   */
  openSearchQuestionDialog(data: ISearchCategory) {
    console.log('openSearchQuestionDialog');

    this.questionnaireTypeId = data.questionnaireTypeId;
    this.activeQuestionIdType = { id: data.qId, type: 'all' };
    this.questionDialogRef = this.dialog.open(this.questionDialog, {
      panelClass: 'profile-question-dialog',
      hasBackdrop: true,
      disableClose: true,
    });
  }

  /**
   * Close question answer dialog
   */
  closeQuestionDialog() {
    if (this.isProfileDialogOpen) {
      this.isProfileDialogOpen = false;
    }
    this.questionDialogRef.close();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
