import { Directive, ElementRef, Input, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appReveal]',
  standalone: true
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  @Input() revealDelay: number = 0;
  @Input() revealDirection: 'up' | 'left' | 'right' | 'fade' = 'up';

  private observer!: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    const el = this.el.nativeElement;
    el.classList.add('reveal-init', `reveal-${this.revealDirection}`);

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('reveal-visible'), this.revealDelay);
          this.observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    this.observer.observe(el);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
