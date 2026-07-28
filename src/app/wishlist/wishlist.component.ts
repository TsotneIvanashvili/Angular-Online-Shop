import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService, WishlistItem } from '../services/wishlist.service';
import { CartStateService } from '../services/cart-state.service';
import { ToastService } from '../services/toast.service';
import { StarRatingComponent } from '../shared/star-rating/star-rating.component';
import {
  GsapRevealDirective,
  GsapSplitDirective,
  GsapSpotlightDirective,
} from '../../directives/motion.directives';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    RouterModule,
    CurrencyPipe,
    StarRatingComponent,
    GsapRevealDirective,
    GsapSplitDirective,
    GsapSpotlightDirective,
  ],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent {
  protected wishlist = inject(WishlistService);
  private cart = inject(CartStateService);
  private toast = inject(ToastService);

  protected pending = new Set<string>();

  protected remove(item: WishlistItem) {
    this.wishlist.remove(item.id);
    this.toast.info('Removed from wishlist', item.title);
  }

  protected clearAll() {
    this.wishlist.clear();
    this.toast.info('Wishlist cleared');
  }

  protected addToCart(item: WishlistItem) {
    if (this.pending.has(item.id)) return;
    this.pending.add(item.id);

    this.cart.addItem(item.id, 1).subscribe({
      next: () => {
        this.pending.delete(item.id);
        this.toast.success('Added to cart', item.title);
      },
      error: (err: Error) => {
        this.pending.delete(item.id);
        if (err?.message === 'NOT_AUTHED') {
          this.toast.error('Sign in to add items', 'Your cart is tied to your account.');
        } else {
          this.toast.error("We couldn't add that item", 'Please try again.');
        }
      },
    });
  }

  protected isPending(id: string): boolean {
    return this.pending.has(id);
  }
}
