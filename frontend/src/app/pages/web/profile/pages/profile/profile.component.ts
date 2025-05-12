import { Component, inject, OnDestroy, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AboutComponent } from '../../components/about/about.component';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { GetRegQuestions, RegistrationState } from '@app/store';
import { GetAnswer } from '@app/store/actions/profile.action';
import { ProfileState } from '@app/store/states/profile.state';
import { InitialNamePipe } from '@app/shared/pipes';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '@app/core/services';
import { WebHeaderComponent } from '@app/core/layouts/web';
import {
  CategoryQuestionSearchComponent,
  PreferenceComponent,
  RightPanelComponent,
  UpdatePhotoComponent,
} from '../../components';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthenticationService } from '@app/core/authentication';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    AboutComponent,
    InitialNamePipe,
    TranslatePipe,
    CommonModule,
    MatDialogModule,
    WebHeaderComponent,
    RightPanelComponent,
    CategoryQuestionSearchComponent,
    UpdatePhotoComponent,
    PreferenceComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  public showCategorySubmenu = false;
  public language: string = 'english';
  private subscriptions: Subscription[] = [];
  public selectedAboutQuestionnaireTypeId!: number;
  public selectedCategoryActiveId!: number;
  public activeTab = 'about';
  private _store = inject(Store);
  private dialog = inject(MatDialog);
  public searchCategoryDialogRef!: MatDialogRef<string, any>;
  @ViewChild('searchCategoryDialog') searchCategoryDialog!: TemplateRef<string>;
  private regQuestionList$: Observable<IQuestionnaire[]> = this._store.select(
    RegistrationState.regQuestionList
  );
  public viewProfile: IViewProfile | null = null;
  public viewProfile$ = this._store.select(ProfileState.viewProfile);
  private answerList$: Observable<IAnswerList[]> = this._store.select(ProfileState.getAnswerList);

  public categoriesList: ICategoryList[] = [];
  @ViewChild('aboutComp') aboutComponent!: AboutComponent;
  public profileData: IViewProfile | null = null;
  private profileDetails$: Observable<IViewProfile | null> = this._store.select(
    RegistrationState.profileDetails
  );
  // private headings = [
  //   'Great love stories start with a single hello!',
  //   'Enjoy Your Visit - Day 2',
  //   'Discover New Features - Day 3',
  //   'Stay Tuned - Day 4',
  //   'Thank You for Visiting - Day 5',
  // ];
  // private addHeadingClass = ['red', 'green', 'white', 'gold', 'grey'];
  // public heading: string = '';
  // public headingClass: string = '';
  // private timeoutId: any;

  constructor(
    private _translate: TranslateService,
    private _commonService: CommonService,
    private _authService: AuthenticationService
  ) {
    this.fetchQuestionAnswer();
  }

  ngOnInit(): void {
    this.language = this._translate.currentLang === 'zh' ? 'chinese' : 'english';
    this.subscriptions.push(
      this._translate.onLangChange.subscribe(event => {
        this.language = event.lang === 'zh' ? 'chinese' : 'english';
      })
    );
    this.subscriptions.push(
      this._commonService.showCategorySubmenu$.subscribe(
        isShow => (this.showCategorySubmenu = isShow)
      )
    );
    if (this._authService.isAuthenticated()) {
      this.subscriptions.push(
        this.profileDetails$?.subscribe({
          next: details => {
            if (details) {
              this.profileData = details;
            }
          },
        })
      );
    }
    this.getDataFromStore();

    // for heading automatic change .....................
    // this.update();
    // const now = new Date();
    // const midnight = new Date(now);
    // midnight.setHours(24, 0, 0, 0);
    // // const msUntilMidnight = midnight.getTime() - now.getTime();
    // this.timeoutId = setTimeout(() => {
    //   this.update();
    //   // setInterval(() => this.update(), 24 * 60 * 60 * 1000);
    //   setInterval(() => this.update(), 5000);
    // }, 5000);
  }

  // getTodayHeading(): string {
  //   const startDate = new Date('2025-04-01');
  //   const today = new Date();
  //   const diffTime = Math.abs(today.getTime() - startDate.getTime());
  //   // const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  //   const diffDays = Math.floor(diffTime / 5000);
  //   return this.headings[diffDays % this.headings.length];
  // }

  // getTodayHeadingClass(): string {
  //   const startDate = new Date('2025-04-01');
  //   const today = new Date();
  //   const diffTime = Math.abs(today.getTime() - startDate.getTime());
  //   // const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  //   const diffDays = Math.floor(diffTime / 5000);
  //   return this.addHeadingClass[diffDays % this.addHeadingClass.length];
  // }
  // update() {
  //   this.heading = this.getTodayHeading();
  //   // this.headingClass = this.getTodayHeadingClass();
  // }

  getDataFromStore() {
    this.subscriptions.push(
      this.regQuestionList$.subscribe(questionList => {
        this.categoriesList = [];
        if (questionList) {
          questionList.forEach(question => {
            const category = {
              questionnaire_type_id: question.questionnaire_type_id,
              questionnaire_type: question.questionnaire_type,
            };
            /**
             * this array arranged for left side category list
             */
            this.categoriesList.push(category);
          });
        }
      })
    );
    this.subscriptions.push(
      this.viewProfile$.subscribe(data => {
        if (data) {
          this.viewProfile = data;
        }
      })
    );
  }

  private fetchQuestionAnswer() {
    this.subscriptions.push(
      forkJoin([
        this._store.dispatch(new GetRegQuestions({ questionnaire_type_id: '' })),
        this._store.dispatch(new GetAnswer({ questionnaire_type_id: '' })),
      ]).subscribe()
    );
  }

  /**
   * Open search category dialog
   * @param event
   */
  openSearchCategoryDialog(event: Event) {
    event.stopPropagation();
    this.searchCategoryDialogRef = this.dialog.open(this.searchCategoryDialog, {
      panelClass: 'search-category-dialog',
      autoFocus: false,
      hasBackdrop: true,
      disableClose: true,
    });
  }

  /**
   * Close search category dialog
   */
  closeSearchCategoryDialog() {
    this.searchCategoryDialogRef.close();
  }

  /**
   * This is called from 'about' component for selected 'Questionnaire Id' update
   * @param questionId
   */
  getQuestion(questionId: number) {
    if (questionId === 1 || questionId === 3 || questionId === 6 || questionId === 7) {
      this.activeTab = 'preference';
    } else {
      this.selectedAboutQuestionnaireTypeId = questionId;
    }
    this.selectedCategoryActiveId = questionId;
  }

  /**
   * This is called from 'search category' component for selected 'Questionnaire Id' update
   * and particular question dialog open into the 'about' component
   * @param data
   */
  getSearchQuestion(data: ISearchCategory) {
    if (
      data.questionnaireTypeId === 1 ||
      data.questionnaireTypeId === 3 ||
      data.questionnaireTypeId === 6 ||
      data.questionnaireTypeId === 7
    ) {
      this.activeTab = 'preference';
    } else {
      this.activeTab = 'about';
      this.selectedAboutQuestionnaireTypeId = data.questionnaireTypeId;
      setTimeout(() => {
        console.log(this.aboutComponent);
        if (this.aboutComponent) {
          this.aboutComponent.openSearchQuestionDialog(data);
        }
      });
    }
    this.selectedCategoryActiveId = data.questionnaireTypeId;
    this.closeSearchCategoryDialog();
  }

  /**
   * This function is call with left category menu click and update the
   * 'selectedAboutQuestionnaireTypeId' which is sent through the 'input' to
   * about component and this 'input' change 'arrangeQuestionAnswer' is
   * called in about component
   * @param id
   */
  showQuestion(id: number) {
    if (id === 1 || id === 3 || id === 6 || id === 7) {
      this.activeTab = 'preference';
    } else {
      this.activeTab = 'about';
      this.selectedAboutQuestionnaireTypeId = id;
    }
    this.selectedCategoryActiveId = id;
  }

  /**
   * About and Partner Profile tab active functionality depends on 'selectedAboutQuestionnaireTypeId'
   */
  // get tabActive() {
  //   if (
  //     this.selectedAboutQuestionnaireTypeId === 1 ||
  //     this.selectedAboutQuestionnaireTypeId === 3 ||
  //     this.selectedAboutQuestionnaireTypeId === 6 ||
  //     this.selectedAboutQuestionnaireTypeId === 7
  //   ) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  /**
   * About tab redirection and 'profile basics' default select
   */
  // public redirectToAboutTab() {
  //   if (this.tabActive && this.selectedAboutQuestionnaireTypeId) {
  //     this.selectedAboutQuestionnaireTypeId = 2;
  //   }
  // }

  /**
   * Partner Profile tab redirection and 'partner preference' default select
   */
  // public redirectToPartnerTab() {
  //   if (!this.tabActive && this.selectedAboutQuestionnaireTypeId) {
  //     this.selectedAboutQuestionnaireTypeId = 1;
  //   }
  // }
  public tabActive(type: string) {
    this.activeTab = type;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
