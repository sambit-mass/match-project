import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[scrollSpy]',
  standalone: true,
})
export class ScrollSpyDirective {
  private currentSection: string = '';
  @Input() public spiedTags: string[] = [];
  @Output() public sectionChange = new EventEmitter<string>();

  constructor(private _el: ElementRef) {}

  @HostListener('scroll', ['$event'])
  onScroll(event: Event) {
    let currentSection: string = '';
    const children = this._el.nativeElement.children;
    const scrollTop = (<HTMLElement>event.target).scrollTop;
    const parentOffset = (<HTMLElement>event.target).offsetTop;
    for (let i = 0; i < children.length; i++) {
      const element = children[i];
      if (this.spiedTags.some(spiedTag => spiedTag === element.tagName)) {
        if (element.offsetTop - parentOffset <= scrollTop) {
          currentSection = element.id;
        }
      }
    }
    // section id should be return here
    if (currentSection !== this.currentSection) {
      this.currentSection = currentSection;
      this.sectionChange.emit(this.currentSection);
    }
  }
}
