import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <span class="stars" [attr.aria-label]="label" role="img">
      <span class="stars__track" aria-hidden="true">
        @for (s of slots; track s) { <i class="fa-solid fa-star"></i> }
      </span>
      <span class="stars__fill" [style.width.%]="percent" aria-hidden="true">
        @for (s of slots; track s) { <i class="fa-solid fa-star"></i> }
      </span>
    </span>
    @if (showValue) {
      <span class="stars__value num">{{ value | number: '1.1-1' }}</span>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .stars {
      position: relative;
      display: inline-block;
      line-height: 1;
      font-size: 0.7rem;
    }
    .stars__track,
    .stars__fill {
      display: flex;
      gap: 0.12rem;
      white-space: nowrap;
    }
    .stars__track { color: rgba(255, 255, 255, 0.13); }
    .stars__fill {
      position: absolute;
      inset: 0;
      overflow: hidden;
      color: var(--accent);
    }
    .stars__value {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-3);
    }
  `],
})
export class StarRatingComponent {
  @Input({ required: true }) value = 0;
  @Input() showValue = true;

  protected readonly slots = [1, 2, 3, 4, 5];

  protected get percent(): number {
    return Math.max(0, Math.min(100, (this.value / 5) * 100));
  }

  protected get label(): string {
    return `Rated ${(this.value ?? 0).toFixed(1)} out of 5`;
  }
}
