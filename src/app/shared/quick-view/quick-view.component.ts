import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../interfaces/product';
import { CartStateService } from '../../services/cart-state.service';
import { ToastService } from '../../services/toast.service';
import { WishlistService } from '../../services/wishlist.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-quick-view',
  standalone: true,
  imports: [RouterModule, CurrencyPipe, StarRatingComponent],
  templateUrl: './quick-view.component.html',
  styleUrl: './quick-view.component.css',
})
export class QuickViewComponent implements OnInit, OnDestroy {
  private host: ElementRef<HTMLElement> = inject(ElementRef);

  /**
   * ScrollSmoother puts a transform on #smooth-content, and a transformed
   * ancestor makes `position: fixed` resolve against that element instead
   * of the viewport — which parks this dialog far down the page. Moving the
   * host to <body> takes it out from under the transform. Angular keeps
   * managing the component; only the DOM node relocates.
   */
  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      document.body.appendChild(this.host.nativeElement);
    }
  }

  @Input() set product(value: Product | null) {
    this._product = value;
    this.quantity = 1;
    this.activeImage = value?.images?.[0] ?? '';
    this.lockScroll(!!value);
  }
  get product(): Product | null { return this._product; }

  @Output() closed = new EventEmitter<void>();

  private _product: Product | null = null;
  protected quantity = 1;
  protected activeImage = '';
  protected adding = false;

  protected cart = inject(CartStateService);
  protected wishlist = inject(WishlistService);
  private toast = inject(ToastService);

  ngOnDestroy() {
    this.lockScroll(false);
    // The host was re-parented to <body>, so Angular's own cleanup of the
    // original location won't remove it.
    this.host.nativeElement.remove();
  }

  @HostListener('document:keydown.escape')
  protected close() {
    this.lockScroll(false);
    this.closed.emit();
  }

  protected onBackdrop(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('qv')) this.close();
  }

  protected get isSaved(): boolean {
    return !!this._product && this.wishlist.has(this._product._id);
  }

  protected toggleSave() {
    if (!this._product) return;
    const saved = this.wishlist.toggle(this._product);
    saved
      ? this.toast.success('Saved to wishlist', this._product.title)
      : this.toast.info('Removed from wishlist', this._product.title);
  }

  protected step(delta: number) {
    const max = this._product?.stock ?? 1;
    this.quantity = Math.max(1, Math.min(max, this.quantity + delta));
  }

  protected addToCart() {
    if (!this._product || this.adding) return;
    this.adding = true;

    this.cart.addItem(this._product._id, this.quantity).subscribe({
      next: () => {
        this.adding = false;
        this.toast.success(
          'Added to cart',
          `${this.quantity} × ${this._product?.title}`
        );
        this.close();
      },
      error: (err: Error) => {
        this.adding = false;
        if (err?.message === 'NOT_AUTHED') {
          this.toast.error('Sign in to add items', 'Your cart is tied to your account.');
        } else {
          this.toast.error("We couldn't add that item", 'Please try again.');
        }
      },
    });
  }

  private lockScroll(lock: boolean) {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = lock ? 'hidden' : '';
  }
}
