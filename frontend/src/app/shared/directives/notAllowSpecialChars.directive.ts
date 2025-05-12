import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNoSpecialCharacters]',
  standalone: true,
})
export class NoSpecialCharactersDirective {
  constructor() {}

  @HostListener('keypress', ['$event']) onKeyPress(event: KeyboardEvent) {
    const allowedCharacters = /[a-zA-Z0-9 ]/; // Regular expression to allow alphanumeric characters and spaces
    const inputChar = String.fromCharCode(event.charCode);
    if (!allowedCharacters.test(inputChar)) {
      event.preventDefault();
    }
  }
}
