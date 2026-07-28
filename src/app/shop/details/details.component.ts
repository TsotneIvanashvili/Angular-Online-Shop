import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { ProductsAreaService } from '../../services/products-area.service';
import { CartStateService } from '../../services/cart-state.service';
import { ToastService } from '../../services/toast.service';
import { WishlistService } from '../../services/wishlist.service';
import { ToolsService } from '../../services/tools.service';
import { Product } from '../../../interfaces/product';

import { RelatedProdsComponent } from './related-prods/related-prods.component';
import { SignErrComponent } from '../../sign-err/sign-err.component';
import { StarRatingComponent } from '../../shared/star-rating/star-rating.component';
// SplitText is deliberately not used on the product title: the element
// persists while its text changes as you hop between related products,
// which would leave a stale split behind.
import {
  GsapRevealDirective,
  GsapMagneticDirective,
} from '../../../directives/motion.directives';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RelatedProdsComponent,
    SignErrComponent,
    StarRatingComponent,
    GsapRevealDirective,
    GsapMagneticDirective,
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private service = inject(ProductsAreaService);
  private cart = inject(CartStateService);
  private toast = inject(ToastService);
  private tools = inject(ToolsService);
  protected wishlist = inject(WishlistService);

  protected product: Product | null = null;
  protected loading = true;
  protected failed = false;

  protected mainImage = '';
  protected quantity = 1;
  protected adding = false;

  private sub = new Subscription();

  ngOnInit(): void {
    this.sub.add(
      this.route.params.subscribe((params: Params) => {
        this.load(params['id']);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private load(id: string) {
    if (!id) return;

    this.loading = true;
    this.failed = false;

    this.service.getProductDetailInfo(id).subscribe({
      next: (data: Product) => {
        this.product = data;
        this.mainImage = data.images?.[0] ?? '';
        this.quantity = 1;
        this.loading = false;
      },
      error: () => {
        this.product = null;
        this.loading = false;
        this.failed = true;
      },
    });
  }

  /** Related products navigate in place rather than re-routing. */
  protected onRelatedSelected(id: string) {
    this.load(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected setImage(img: string) {
    this.mainImage = img;
  }

  protected step(delta: number) {
    const max = this.product?.stock ?? 1;
    this.quantity = Math.max(1, Math.min(max, this.quantity + delta));
  }

  protected get isSaved(): boolean {
    return !!this.product && this.wishlist.has(this.product._id);
  }

  protected toggleSave() {
    if (!this.product) return;
    const saved = this.wishlist.toggle(this.product);
    saved
      ? this.toast.success('Saved to wishlist', this.product.title)
      : this.toast.info('Removed from wishlist', this.product.title);
  }

  protected addToCart() {
    if (!this.product || this.adding) return;
    this.adding = true;

    this.cart.addItem(this.product._id, this.quantity).subscribe({
      next: () => {
        this.adding = false;
        this.toast.success('Added to cart', `${this.quantity} × ${this.product?.title}`);
      },
      error: (err: Error) => {
        this.adding = false;
        if (err?.message === 'NOT_AUTHED') {
          // The sign-in prompt offers both routes, which a toast can't.
          this.tools.isErrSMS.next(true);
        } else {
          this.toast.error("We couldn't add that item", 'Please try again.');
        }
      },
    });
  }

  protected scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
