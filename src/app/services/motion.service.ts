import { Injectable, NgZone, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';

/**
 * Owns every GSAP concern in the app: plugin registration, the smooth
 * scroller, and keeping ScrollTriggers honest across route changes.
 *
 * All animation work runs outside Angular's zone — GSAP drives its own
 * rAF loop, and letting it tick inside the zone would fire change
 * detection on every frame.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private zone = inject(NgZone);
  private router = inject(Router);

  private smoother: ScrollSmoother | null = null;
  private started = false;

  /** True when the user asked for less motion, or we're on a touch device. */
  readonly reduced = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText, CustomEase);

    // A single house easing curve — weighty out, no bounce.
    CustomEase.create('out-expo', '0.16, 1, 0.3, 1');
    CustomEase.create('io', '0.65, 0, 0.35, 1');

    gsap.defaults({ ease: 'out-expo', duration: 0.9 });
  }

  /** Called once from the app shell after the view exists. */
  init() {
    if (this.started || typeof window === 'undefined') return;
    this.started = true;

    this.zone.runOutsideAngular(() => {
      if (!this.reduced) {
        this.smoother = ScrollSmoother.create({
          wrapper: '#smooth-wrapper',
          content: '#smooth-content',
          smooth: 1.15,
          effects: true,
          // Native scrolling on touch — smoothing there fights the OS.
          smoothTouch: 0,
          normalizeScroll: true,
        });
      }

      // Each navigation swaps the outlet contents, so old triggers point at
      // detached nodes. Kill them, jump to top, then let the new page register.
      this.router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe(() => {
          this.scrollTo(0, true);
          requestAnimationFrame(() => ScrollTrigger.refresh());
        });
    });
  }

  /** Scrolls the page, going through the smoother when it is active. */
  scrollTo(target: number | string | Element, immediate = false) {
    this.zone.runOutsideAngular(() => {
      if (this.smoother) {
        this.smoother.scrollTo(target as any, !immediate);
        return;
      }
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' });
      } else {
        gsap.to(window, { scrollTo: target, duration: immediate ? 0 : 0.8 });
      }
    });
  }

  /** Recalculates trigger positions after content height changes. */
  refresh() {
    this.zone.runOutsideAngular(() => ScrollTrigger.refresh());
  }

  /** Runs a callback outside Angular, for components building timelines. */
  run<T>(fn: () => T): T {
    return this.zone.runOutsideAngular(fn);
  }

  destroy() {
    this.smoother?.kill();
    this.smoother = null;
    ScrollTrigger.getAll().forEach((t) => t.kill());
    this.started = false;
  }
}
