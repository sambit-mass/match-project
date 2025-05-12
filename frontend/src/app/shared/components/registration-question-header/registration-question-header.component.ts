import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-registration-question-header',
  standalone: true,
  imports: [TranslatePipe, CommonModule],
  templateUrl: './registration-question-header.component.html',
  styleUrl: './registration-question-header.component.scss',
})
export class RegistrationQuestionHeaderComponent {
  @Input('count') count!: number;
  @Input('language') language!: string | null;
  @Input('questionLength') questionLength!: number;
  @Input('questionListObject') questionListObject!: ILanguageText;
  @Input('isActive') isActive!: number;
  public nineArray = Array(9);

  constructor(private _translate: TranslateService) {}
}
