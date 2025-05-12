import { NgControl } from '@angular/forms';
import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[noLeadingWhitespace]',
  standalone: true,
})
export class NotAllowWhiteSpaceAtStartDirective {
  constructor(
    private el: ElementRef,
    private ngControl: NgControl
  ) {}

  @HostListener('input', ['$event']) onInput(): void {
    const inputValue: string = this.el.nativeElement.value;
    this.el.nativeElement.value = inputValue.trimStart();
    this.ngControl.control?.setValue(inputValue.trimStart());
  }
}
