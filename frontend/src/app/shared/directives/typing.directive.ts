import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appTyping]',
  standalone: true,
})
export class TypingDirective implements OnInit, OnDestroy {
  @Input({ required: true }) appTyping!: string; // This is the translation key
  @Input() typingDelayOnLangChange = 0;
  @Input() typingSpeed = 100;
  @Input() typingDelay = 0;
  private interval!: NodeJS.Timeout;
  private langChangeSub?: Subscription;

  constructor(
    private el: ElementRef<HTMLElement>,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.startTyping();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.startTyping(true); // Re-translate and re-type on language change
    });
  }

  private startTyping(isLangChange = false): void {
    if (this.interval) clearInterval(this.interval);
    this.el.nativeElement.textContent = '';
    setTimeout(
      () => {
        const translatedText = this.translate.instant(this.appTyping);
        this.typeText(translatedText);
      },
      !isLangChange ? this.typingDelay : this.typingDelayOnLangChange
    );
  }

  private typeText(text: string): void {
    let index = 0;
    this.interval = setInterval(() => {
      if (index < text.length) {
        this.el.nativeElement.textContent += text.charAt(index++);
      } else {
        if (this.interval) clearInterval(this.interval);
      }
    }, this.typingSpeed);
  }

  ngOnDestroy(): void {
    this.langChangeSub?.unsubscribe();
  }
}
