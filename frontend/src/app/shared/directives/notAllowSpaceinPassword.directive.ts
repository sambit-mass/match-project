import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[noWhitespaceInPassword]',
  standalone: true,
})
export class NotAllowSpaceInPasswordDirective {
  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent): void {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }
}
