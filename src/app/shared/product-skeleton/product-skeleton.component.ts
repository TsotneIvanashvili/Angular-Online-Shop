import { Component, Input } from '@angular/core';

/** Placeholder that mirrors the product card's real shape and rhythm. */
@Component({
  selector: 'app-product-skeleton',
  standalone: true,
  template: `
    @for (i of slots; track i) {
      <article class="sk" [style.animation-delay.ms]="i * 60" aria-hidden="true">
        <div class="skeleton sk__media"></div>
        <div class="sk__body">
          <div class="skeleton sk__line" style="width: 32%"></div>
          <div class="skeleton sk__line" style="width: 88%"></div>
          <div class="skeleton sk__line" style="width: 58%"></div>
          <div class="sk__foot">
            <div class="skeleton sk__line" style="width: 40%; height: 18px"></div>
          </div>
        </div>
      </article>
    }
  `,
  styles: [`
    :host { display: contents; }

    .sk {
      display: flex;
      flex-direction: column;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      overflow: hidden;
      animation: sk-in 400ms var(--ease-out) both;
    }

    @keyframes sk-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: none; }
    }

    .sk__media { aspect-ratio: 4 / 3; border-radius: 0; }

    .sk__body {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      padding: 1rem;
    }

    .sk__line { height: 11px; border-radius: var(--r-xs); }

    .sk__foot {
      margin-top: 0.5rem;
      padding-top: 0.85rem;
      border-top: 1px solid var(--border);
    }
  `],
})
export class ProductSkeletonComponent {
  @Input() count = 8;

  protected get slots(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
