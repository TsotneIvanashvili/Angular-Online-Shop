import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* ══════════════════════════════════════════════════════════
   [gsapReveal] — scroll-triggered entrance
   ══════════════════════════════════════════════════════════ */

@Directive({ selector: '[gsapReveal]', standalone: true })
export class GsapRevealDirective implements AfterViewInit, OnDestroy {
  private el: ElementRef<HTMLElement> = inject(ElementRef);
  private zone = inject(NgZone);

  /** Children matching this selector animate in a stagger instead of the host. */
  @Input() revealChildren?: string;
  @Input() revealY = 40;
  @Input() revealX = 0;
  @Input() revealDelay = 0;
  @Input() revealStagger = 0.08;
  @Input() revealDuration = 1;
  @Input() revealScale = 1;
  @Input() revealStart = 'top 88%';

  private ctx?: gsap.Context;
  private observer?: MutationObserver;
  private queued = false;

  private static readonly FLAG = 'gsapRevealed';

  ngAfterViewInit(): void {
    if (prefersReduced()) return;

    this.zone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {}, this.el.nativeElement);
      this.sweep();

      // Product grids fill in after their HTTP call resolves, long after
      // this hook runs — so watch for children arriving and reveal those too.
      if (this.revealChildren) {
        this.observer = new MutationObserver(() => this.schedule());
        this.observer.observe(this.el.nativeElement, { childList: true, subtree: true });
      }
    });
  }

  private schedule() {
    if (this.queued) return;
    this.queued = true;
    requestAnimationFrame(() => {
      this.queued = false;
      this.sweep();
    });
  }

  /** Animates any matching element that hasn't been revealed yet. */
  private sweep() {
    const host = this.el.nativeElement;

    const candidates: HTMLElement[] = this.revealChildren
      ? Array.from(host.querySelectorAll<HTMLElement>(this.revealChildren))
      : [host];

    const targets = candidates.filter((el) => !(el.dataset[GsapRevealDirective.FLAG]));
    if (!targets.length) return;

    targets.forEach((el) => (el.dataset[GsapRevealDirective.FLAG] = '1'));

    this.ctx?.add(() => {
      // fromTo rather than from: a `from` tween that never plays (a trigger
      // that mis-measures, a refresh at the wrong moment) leaves the element
      // stranded at opacity 0 forever. fromTo always lands on the end state.
      gsap.fromTo(
        targets,
        {
          opacity: 0,
          y: this.revealY,
          x: this.revealX,
          scale: this.revealScale,
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: this.revealDuration,
          delay: this.revealDelay,
          stagger: this.revealStagger,
          ease: 'out-expo',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: host,
            start: this.revealStart,
            once: true,
          },
        }
      );

      // Targets that arrived after the last refresh would otherwise have
      // their trigger measured against stale layout.
      ScrollTrigger.refresh();
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.ctx?.revert();
  }
}

/* ══════════════════════════════════════════════════════════
   [gsapSplit] — headline reveal, line or character level
   ══════════════════════════════════════════════════════════ */

@Directive({ selector: '[gsapSplit]', standalone: true })
export class GsapSplitDirective implements AfterViewInit, OnDestroy {
  private el: ElementRef<HTMLElement> = inject(ElementRef);
  private zone = inject(NgZone);

  @Input() splitBy: 'lines' | 'chars' | 'words' = 'lines';
  @Input() splitDelay = 0;
  @Input() splitStagger = 0.09;
  @Input() splitDuration = 1.15;
  /** Skips the ScrollTrigger and plays immediately (for above-the-fold copy). */
  @Input() splitImmediate = false;

  private ctx?: gsap.Context;
  private split?: SplitText;

  ngAfterViewInit(): void {
    if (prefersReduced()) return;

    this.zone.runOutsideAngular(() => {
      // Wait for webfonts, otherwise lines are measured against the
      // fallback face and re-wrap after the split is committed.
      const start = () => {
        this.ctx = gsap.context(() => {
          this.split = new SplitText(this.el.nativeElement, {
            type: this.splitBy,
            linesClass: 'split-line',
            mask: this.splitBy === 'lines' ? 'lines' : undefined,
          });

          const targets = (this.split as any)[this.splitBy] as HTMLElement[];
          if (!targets?.length) return;

          // fromTo, so a trigger that never fires can't leave the headline
          // parked below its mask and permanently invisible.
          gsap.fromTo(
            targets,
            { yPercent: 118, opacity: this.splitBy === 'lines' ? 1 : 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: this.splitDuration,
              delay: this.splitDelay,
              stagger: this.splitStagger,
              ease: 'out-expo',
              scrollTrigger: this.splitImmediate
                ? undefined
                : { trigger: this.el.nativeElement, start: 'top 95%', once: true },
            }
          );

          // Splitting rewrites the element's box, so every trigger measured
          // before this point (including this one) is now stale.
          ScrollTrigger.refresh();
        }, this.el.nativeElement);
      };

      if ((document as any).fonts?.ready) {
        (document as any).fonts.ready.then(start);
      } else {
        start();
      }
    });
  }

  ngOnDestroy(): void {
    this.split?.revert();
    this.ctx?.revert();
  }
}

/* ══════════════════════════════════════════════════════════
   [gsapParallax] — depth on scroll
   ══════════════════════════════════════════════════════════ */

@Directive({ selector: '[gsapParallax]', standalone: true })
export class GsapParallaxDirective implements AfterViewInit, OnDestroy {
  private el: ElementRef<HTMLElement> = inject(ElementRef);
  private zone = inject(NgZone);

  /** Positive drifts down (slower), negative drifts up (faster). */
  @Input() parallaxAmount = -80;
  @Input() parallaxScale = 1;

  private ctx?: gsap.Context;

  ngAfterViewInit(): void {
    if (prefersReduced()) return;

    this.zone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        gsap.fromTo(
          this.el.nativeElement,
          { y: -this.parallaxAmount / 2, scale: this.parallaxScale },
          {
            y: this.parallaxAmount / 2,
            ease: 'none',
            scrollTrigger: {
              trigger: this.el.nativeElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        );
      }, this.el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}

/* ══════════════════════════════════════════════════════════
   [gsapMagnetic] — cursor attraction on buttons
   ══════════════════════════════════════════════════════════ */

@Directive({ selector: '[gsapMagnetic]', standalone: true })
export class GsapMagneticDirective implements OnDestroy {
  private el: ElementRef<HTMLElement> = inject(ElementRef);
  private zone = inject(NgZone);

  @Input() magneticStrength = 0.32;

  private quickX?: gsap.QuickToFunc;
  private quickY?: gsap.QuickToFunc;

  private get enabled(): boolean {
    return !prefersReduced() && window.matchMedia('(hover: hover)').matches;
  }

  @HostListener('mouseenter')
  onEnter() {
    if (!this.enabled || this.quickX) return;
    this.zone.runOutsideAngular(() => {
      this.quickX = gsap.quickTo(this.el.nativeElement, 'x', { duration: 0.45, ease: 'power3' });
      this.quickY = gsap.quickTo(this.el.nativeElement, 'y', { duration: 0.45, ease: 'power3' });
    });
  }

  @HostListener('mousemove', ['$event'])
  onMove(event: MouseEvent) {
    if (!this.enabled || !this.quickX || !this.quickY) return;
    const rect = this.el.nativeElement.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    this.quickX(dx * this.magneticStrength);
    this.quickY(dy * this.magneticStrength);
  }

  @HostListener('mouseleave')
  onLeave() {
    if (!this.quickX || !this.quickY) return;
    this.quickX(0);
    this.quickY(0);
  }

  ngOnDestroy(): void {
    gsap.killTweensOf(this.el.nativeElement);
  }
}

/* ══════════════════════════════════════════════════════════
   [gsapSpotlight] — border/glow that tracks the cursor
   ══════════════════════════════════════════════════════════ */

@Directive({ selector: '[gsapSpotlight]', standalone: true })
export class GsapSpotlightDirective {
  private el: ElementRef<HTMLElement> = inject(ElementRef);

  @HostListener('pointermove', ['$event'])
  onMove(event: PointerEvent) {
    const host = this.el.nativeElement;
    const rect = host.getBoundingClientRect();
    // Consumed by CSS as a radial-gradient origin.
    host.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    host.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }
}

/* ══════════════════════════════════════════════════════════
   [gsapCounter] — count up when scrolled into view
   ══════════════════════════════════════════════════════════ */

@Directive({ selector: '[gsapCounter]', standalone: true })
export class GsapCounterDirective implements AfterViewInit, OnDestroy {
  private el: ElementRef<HTMLElement> = inject(ElementRef);
  private zone = inject(NgZone);

  @Input({ required: true }) counterTo!: number;
  @Input() counterDecimals = 0;
  @Input() counterSuffix = '';

  private ctx?: gsap.Context;

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;
    const format = (v: number) =>
      v.toLocaleString('en-US', {
        minimumFractionDigits: this.counterDecimals,
        maximumFractionDigits: this.counterDecimals,
      }) + this.counterSuffix;

    if (prefersReduced()) {
      host.textContent = format(this.counterTo);
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        const state = { value: 0 };
        gsap.to(state, {
          value: this.counterTo,
          duration: 1.8,
          ease: 'io',
          onUpdate: () => (host.textContent = format(state.value)),
          scrollTrigger: { trigger: host, start: 'top 92%', once: true },
        });
      }, host);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}

/* ══════════════════════════════════════════════════════════
   [gsapMarquee] — seamless loop that reacts to scroll velocity
   ══════════════════════════════════════════════════════════ */

@Directive({ selector: '[gsapMarquee]', standalone: true })
export class GsapMarqueeDirective implements AfterViewInit, OnDestroy {
  private el: ElementRef<HTMLElement> = inject(ElementRef);
  private zone = inject(NgZone);

  @Input() marqueeSpeed = 55;

  private ctx?: gsap.Context;

  ngAfterViewInit(): void {
    if (prefersReduced()) return;

    this.zone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        const track = this.el.nativeElement;

        const loop = gsap.to(track, {
          xPercent: -50,
          duration: this.marqueeSpeed,
          ease: 'none',
          repeat: -1,
        });

        // Scrubbing the page nudges the loop's speed and skews the type,
        // so the strip feels connected to the scroll rather than decorative.
        ScrollTrigger.create({
          trigger: track,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const v = self.getVelocity();
            const skew = gsap.utils.clamp(-14, 14, v / 220);
            gsap.to(track, { skewX: skew, duration: 0.4, ease: 'power2.out' });
            loop.timeScale(gsap.utils.clamp(0.4, 4, 1 + Math.abs(v) / 2200));
          },
          onLeave: () => gsap.to(track, { skewX: 0, duration: 0.5 }),
        });
      }, this.el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
