import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appScrolling]',
})
export class ScrollingDirective {
  constructor(public el: ElementRef, public renderer: Renderer2) {}

  @HostListener('window:scroll') onScrolling() {
    if (window.scrollY > 360) {
      this.renderer.addClass(this.el.nativeElement, 'navbarSolid');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'navbarSolid');
    }
  }
}
