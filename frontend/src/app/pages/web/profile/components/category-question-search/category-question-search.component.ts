import { Store } from '@ngxs/store';
import { CommonModule } from '@angular/common';
import { RegistrationState } from '@app/store';
import { Subscription, Observable } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { HighlightPipe } from '@app/shared/pipes/highlight.pipe';
@Component({
  selector: 'app-category-question-search',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    HighlightPipe,
    TranslatePipe,
  ],
  templateUrl: './category-question-search.component.html',
  styleUrl: './category-question-search.component.scss',
})
export class CategoryQuestionSearchComponent implements OnInit, OnDestroy {
  public language: string = 'english';
  private _store = inject(Store);
  public subscriptions: Subscription[] = [];
  public regQuestionList: IQuestionnaire[] = [];
  public answerList: IAnswerList[] = [];
  public searchCategoryList: ISearchCategory[] = [];
  public filteredCategoryType!: ISearchCategory[] | undefined;
  public isShowSearchList = false;
  private regQuestionList$: Observable<IQuestionnaire[]> = this._store.select(
    RegistrationState.regQuestionList
  );
  @Input('questionerId') questionerId!: number;
  @Output() searchQuestion = new EventEmitter<ISearchCategory>();
  @Output() selectQuestionMenu = new EventEmitter<number>();
  @Output() closeCategory = new EventEmitter();
  @ViewChild('categoryTypeInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('dialogWrapper') dialogWrapper!: ElementRef;
  private isInputFocused = false;

  /**
   * This array is use for first time image and questionnaire_type show
   */
  public categoriesList: ICategoryList[] = [
    {
      questionnaire_type_id: 1,
      questionnaire_type: { en: 'Partner Preference', zh: '伴侣偏好' },
      url: '/images/Partner-Preference-image.png',
    },
    {
      questionnaire_type_id: 2,
      questionnaire_type: { en: 'Profile Basics', zh: '个人资料基本信息' },
      url: '/images/page-common-character2.png',
    },
    {
      questionnaire_type_id: 3,
      questionnaire_type: { en: 'Lifestyle Preferences', zh: '生活方式偏好' },
      url: '/images/Lifestyle-preferences-image.png',
    },
    {
      questionnaire_type_id: 4,
      questionnaire_type: { en: 'Values and Beliefs', zh: '价值观和信仰' },
      url: '/images/value&beliefs-image.png',
    },
    {
      questionnaire_type_id: 5,
      questionnaire_type: { en: 'Personality and Interests', zh: '个性和兴趣' },
      url: '/images/personality&interests-image.png',
    },
    {
      questionnaire_type_id: 6,
      questionnaire_type: { en: 'Relationship Preferences', zh: '关系偏好' },
      url: '/images/Relationship-preferences-image.png',
    },
    {
      questionnaire_type_id: 7,
      questionnaire_type: { en: 'Dating Preferences', zh: '约会偏好' },
      url: '/images/Date-preferences-image.png',
    },
    {
      questionnaire_type_id: 8,
      questionnaire_type: { en: 'Communication and Interaction', zh: '沟通与互动' },
      url: '/images/Communication&interaction-image.png',
    },
    {
      questionnaire_type_id: 9,
      questionnaire_type: { en: 'Future Aspirations', zh: '未来愿景' },
      url: '/images/Future-aspirations-image.png',
    },
  ];
  constructor(private _translate: TranslateService) {}

  ngOnInit(): void {
    this.language = this._translate.currentLang === 'zh' ? 'chinese' : 'english';
    this.subscriptions.push(
      this._translate.onLangChange.subscribe(event => {
        this.language = event.lang === 'zh' ? 'chinese' : 'english';
      })
    );
    this.getQuestionAnswerFromStore();
  }

  // focus----

  onInputBlur(): void {
    this.isInputFocused = false;
  }

  @HostListener('document:mousedown', ['$event'])
  handleClick(event: MouseEvent): void {
    const clickedTarget = event.target as HTMLElement;

    const clickedInsideDialog = this.dialogWrapper.nativeElement.contains(clickedTarget);
    const clickedSearchInput = this.searchInput.nativeElement.contains(clickedTarget);

    // Clicked OUTSIDE the dialog: re-focus the input
    if (!clickedInsideDialog && this.isInputFocused) {
      setTimeout(() => this.searchInput.nativeElement.focus(), 0);
    }

    // Clicked INSIDE the dialog, but NOT the input → allow blur
    if (clickedInsideDialog && !clickedSearchInput) {
      // input will blur naturally
    }
  }

  // ------------------

  // ngAfterViewInit(): void {
  //   // Find the backdrop and add a click listener
  //   const backdrop = document.querySelector('.cdk-overlay-backdrop');
  //   if (backdrop) {
  //     backdrop.addEventListener('click', event => {
  //       // Check if autocomplete panel is open
  //       const autocompletePanel = document.querySelector('.mat-autocomplete-panel');
  //       if (autocompletePanel && autocompletePanel.contains(event.target as Node)) {
  //         event.stopPropagation(); // Prevent dialog close
  //       } else {
  //         this.closeDialog(); // Close the dialog manually if click is not on the autocomplete
  //       }
  //     });
  //   }
  // }

  private getQuestionAnswerFromStore() {
    this.subscriptions.push(
      this.regQuestionList$.subscribe({
        next: apiResult => {
          if (apiResult.length) {
            this.regQuestionList = apiResult;
            for (let i = 0; i < this.regQuestionList.length; i++) {
              for (let j = 0; j < this.regQuestionList[i].questions.length; j++) {
                //this condition for ignoring the id 1 and 2 question
                if (
                  !(
                    this.regQuestionList[i].questions[j].q_id === 1 ||
                    this.regQuestionList[i].questions[j].q_id === 2
                  )
                ) {
                  const category: ISearchCategory = {
                    questionnaireTypeId: this.regQuestionList[i].questionnaire_type_id,
                    qId: this.regQuestionList[i].questions[j].q_id,
                    questionName: this.regQuestionList[i].questionnaire_type,
                    question: this.regQuestionList[i].questions[j].question,
                  };
                  this.searchCategoryList.push(category);
                }
              }
            }
          }
        },
      })
    );
  }

  public _filterCategoryType(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredCategoryType = this.searchCategoryList.filter(option =>
      this.language === 'chinese'
        ? option.question.zh.toLowerCase().includes(filterValue) ||
          option.questionName.zh.toLowerCase().includes(filterValue)
        : option.question.en.toLowerCase().includes(filterValue) ||
          option.questionName.en.toLowerCase().includes(filterValue)
    );

    return this.filteredCategoryType.length
      ? this.filteredCategoryType
      : this.language === 'chinese'
        ? [{ zh: '没有找到记录' } as ILanguageText]
        : [{ en: 'No record found' } as ILanguageText];
  }

  public showCategoryType(categoryType: ISearchCategory): string {
    return categoryType && categoryType.question ? categoryType.question.en : '';
  }

  public showFilteredCategoryType(value: string) {
    this.isInputFocused = true;
    this.isShowSearchList = true;
    if (value) {
      this._filterCategoryType(value);
    } else {
      this.filteredCategoryType = this.searchCategoryList.slice();
    }
  }

  public openSearchQuestion(data: ISearchCategory) {
    this.searchQuestion.emit(data);
  }

  /**
   * This is call for left category menu select
   * @param id
   */
  public selectMenu(id: number) {
    this.selectQuestionMenu.emit(id);
  }

  public closeDialog() {
    this.closeCategory.emit();
  }
  public resetCountry() {
    this.searchInput.nativeElement.value = '';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
