import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../interfaces/product';
import { WishlistService } from '../../services/wishlist.service';
import { ToastService } from '../../services/toast.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { GsapSpotlightDirective } from '../../../directives/motion.directives';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterModule, CurrencyPipe, StarRatingComponent, GsapSpotlightDirective],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() index = 0;

  /** Emitted instead of routing when the parent wants to intercept navigation. */
  @Output() open = new EventEmitter<string>();
  @Output() quickView = new EventEmitter<Product>();

  protected wishlist = inject(WishlistService);
  private toast = inject(ToastService);

  protected get discount(): number {
    return Math.round(this.product?.price?.discountPercentage ?? 0);
  }

  protected get isSaved(): boolean {
    return this.wishlist.has(this.product._id);
  }

  protected toggleSave(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const saved = this.wishlist.toggle(this.product);
    saved
      ? this.toast.success('Saved to wishlist', this.product.title)
      : this.toast.info('Removed from wishlist', this.product.title);
  }

  protected onQuickView(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.quickView.emit(this.product);
  }

  protected onOpen(event: Event) {
    if (this.open.observed) {
      event.preventDefault();
      this.open.emit(this.product._id);
    }
  }
}
