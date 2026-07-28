import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { SeveralProductsComponent } from './several-products/several-products.component';
import { ProductsAreaService } from '../services/products-area.service';
import { MotionService } from '../services/motion.service';
import {
  GsapRevealDirective,
  GsapSplitDirective,
  GsapParallaxDirective,
  GsapMagneticDirective,
  GsapCounterDirective,
  GsapMarqueeDirective,
  GsapSpotlightDirective,
} from '../../directives/motion.directives';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SeveralProductsComponent,
    RouterModule,
    GsapRevealDirective,
    GsapSplitDirective,
    GsapParallaxDirective,
    GsapMagneticDirective,
    GsapCounterDirective,
    GsapMarqueeDirective,
    GsapSpotlightDirective,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private products = inject(ProductsAreaService);
  private motion = inject(MotionService);
  private host: ElementRef<HTMLElement> = inject(ElementRef);

  @ViewChild('hero') hero!: ElementRef<HTMLElement>;

  protected brands: string[] = [];
  protected marquee: string[] = [];

  private ctx?: gsap.Context;

  ngOnInit(): void {
    this.products.getBrands().subscribe({
      next: (list) => {
        this.brands = (list ?? []).slice(0, 10);
        this.marquee = [...this.brands, ...this.brands];
        // Marquee width changed, so trigger positions moved.
        requestAnimationFrame(() => this.motion.refresh());
      },
      error: () => {
        this.brands = [];
        this.marquee = [];
      },
    });
  }

  ngAfterViewInit(): void {
    if (this.motion.reduced) return;

    this.motion.run(() => {
      this.ctx = gsap.context((self) => {
        // ── Hero: the whole stage recedes as you scroll past it ──
        gsap.to('.hero__stage', {
          yPercent: 12,
          scale: 0.94,
          opacity: 0.35,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        });

        // ── Layered product shots drift at different rates ──
        gsap.utils.toArray<HTMLElement>('.hero__plate').forEach((plate, i) => {
          gsap.to(plate, {
            yPercent: -18 * (i + 1),
            ease: 'none',
            scrollTrigger: {
              trigger: '.hero',
              start: 'top top',
              end: 'bottom top',
              scrub: 1,
            },
          });
        });

        // ── Intro timeline, plays on load ──
        // Every step is fromTo: a bare `from` renders its start state at
        // build time, so anything that stops the timeline leaves the element
        // invisible for good. fromTo always resolves to the visible state.
        const intro = gsap.timeline({ delay: 0.15 });
        intro
          .fromTo('.hero__eyebrow',
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.7 })
          .fromTo('.hero__plate',
            { opacity: 0, y: 60, scale: 0.92 },
            { opacity: 1, y: 0, scale: 1, stagger: 0.12, duration: 1.3 }, 0.25)
          .fromTo('.hero__cta > *',
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, stagger: 0.09, duration: 0.8, clearProps: 'transform' }, 0.75)
          .fromTo('.hero__stat',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, stagger: 0.08, duration: 0.8 }, 0.9)
          .fromTo('.hero__scroll',
            { opacity: 0 },
            { opacity: 1, duration: 0.6 }, 1.1);

        // ── Promise panels rise as they pass ──
        gsap.utils.toArray<HTMLElement>('.promise').forEach((panel) => {
          gsap.fromTo(panel,
            { opacity: 0, y: 70 },
            {
              opacity: 1,
              y: 0,
              duration: 1.1,
              clearProps: 'transform',
              scrollTrigger: { trigger: panel, start: 'top 90%', once: true },
            });
        });

        // ── Section rules draw themselves in ──
        gsap.utils.toArray<HTMLElement>('.rule').forEach((rule) => {
          gsap.fromTo(rule,
            { scaleX: 0 },
            {
              scaleX: 1,
              transformOrigin: 'left center',
              duration: 1.2,
              scrollTrigger: { trigger: rule, start: 'top 95%', once: true },
            });
        });
      }, this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }

  protected scrollToShop() {
    this.motion.scrollTo('.sellers');
  }
}
