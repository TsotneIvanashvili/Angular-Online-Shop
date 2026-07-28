import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartStateService } from '../services/cart-state.service';
import { ToastService } from '../services/toast.service';
import {
  GsapRevealDirective,
  GsapSplitDirective,
  GsapMagneticDirective,
} from '../../directives/motion.directives';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    RouterModule,
    CurrencyPipe,
    GsapRevealDirective,
    GsapSplitDirective,
    GsapMagneticDirective,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  protected cart = inject(CartStateService);
  private toast = inject(ToastService);

  /** Ids mid-request, so only the affected row shows a pending state. */
  protected pending = new Set<string>();

  ngOnInit(): void {
    this.cart.refresh();
  }

  protected updateQuantity(productId: string, quantity: number) {
    if (quantity < 1 || this.pending.has(productId)) return;

    this.pending.add(productId);
    this.cart.updateQuantity(productId, quantity).subscribe({
      next: () => this.pending.delete(productId),
      error: () => {
        this.pending.delete(productId);
        this.toast.error("We couldn't update that quantity", 'Please try again.');
      },
    });
  }

  protected remove(productId: string, title: string) {
    if (this.pending.has(productId)) return;

    this.pending.add(productId);
    this.cart.removeItem(productId).subscribe({
      next: () => {
        this.pending.delete(productId);
        this.toast.info('Removed from cart', title);
      },
      error: () => {
        this.pending.delete(productId);
        this.toast.error("We couldn't remove that item", 'Please try again.');
      },
    });
  }

  protected isPending(id: string): boolean {
    return this.pending.has(id);
  }
}
