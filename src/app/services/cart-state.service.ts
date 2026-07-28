import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { CartAreaService } from './cart-area.service';
import { ProductsAreaService } from './products-area.service';
import { Product } from '../../interfaces/product';

export interface CartLine {
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  title: string;
  image: string;
  brand: string;
  stock: number;
}

/** Free over this threshold, otherwise a flat rate. */
const FREE_SHIPPING_OVER = 50;
const SHIPPING_FLAT = 9.5;
const TAX_RATE = 0.0825;

@Injectable({ providedIn: 'root' })
export class CartStateService {
  private api = inject(CartAreaService);
  private products = inject(ProductsAreaService);
  private cookie = inject(SsrCookieService);

  readonly lines = signal<CartLine[]>([]);
  readonly loading = signal(false);
  readonly loaded = signal(false);

  readonly count = computed(() =>
    this.lines().reduce((sum, l) => sum + l.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this.lines().reduce((sum, l) => sum + l.lineTotal, 0)
  );

  readonly shipping = computed(() => {
    const sub = this.subtotal();
    if (sub <= 0 || sub >= FREE_SHIPPING_OVER) return 0;
    return SHIPPING_FLAT;
  });

  readonly tax = computed(() => this.subtotal() * TAX_RATE);

  readonly total = computed(() => this.subtotal() + this.shipping() + this.tax());

  readonly freeShippingGap = computed(() =>
    Math.max(0, FREE_SHIPPING_OVER - this.subtotal())
  );

  readonly isAuthed = computed(() => this.cookie.check('userInfo'));

  /**
   * Loads the cart and resolves every product in parallel.
   * The previous implementation pushed into an array from inside
   * nested subscribe callbacks and read it synchronously, so line
   * order was nondeterministic and rows could render half-empty.
   */
  refresh() {
    if (!this.cookie.check('userInfo')) {
      this.lines.set([]);
      this.loaded.set(true);
      return;
    }

    this.loading.set(true);

    this.api
      .getCart()
      .pipe(
        switchMap((data: any) => {
          const raw: any[] = data?.products ?? [];
          if (!raw.length) return of([] as CartLine[]);

          return forkJoin(
            raw.map((item) =>
              this.products.getProductDetailInfo(item.productId).pipe(
                map((product: Product) => this.toLine(item, product)),
                catchError(() => of(this.toLine(item, null)))
              )
            )
          );
        }),
        catchError(() => of([] as CartLine[]))
      )
      .subscribe((lines) => {
        this.lines.set(lines);
        this.loading.set(false);
        this.loaded.set(true);
      });
  }

  /**
   * Adds a product to the cart. The API has no upsert, so we try a
   * quantity patch first and fall back to a create when the line
   * doesn't exist yet. Errors with `NOT_AUTHED` when signed out.
   */
  addItem(productId: string, quantity: number): Observable<unknown> {
    if (!this.cookie.check('userInfo')) {
      return throwError(() => new Error('NOT_AUTHED'));
    }

    const body = { id: productId, quantity };

    return this.api.updateToCart(body).pipe(
      catchError(() => this.api.addToCart(body)),
      tap(() => this.refresh())
    );
  }

  updateQuantity(productId: string, quantity: number): Observable<unknown> {
    if (quantity < 1) return of(null);
    return this.api
      .updateToCart({ id: productId, quantity })
      .pipe(tap(() => this.refresh()));
  }

  removeItem(productId: string): Observable<unknown> {
    return this.api
      .deleteProduct({ id: productId })
      .pipe(tap(() => this.refresh()));
  }

  private toLine(item: any, product: Product | null): CartLine {
    const quantity = Number(item.quantity) || 1;
    // The API's `pricePerQuantity` is the unit price; fall back to the
    // product's own current price when the cart payload omits it.
    const unitPrice = Number(item.pricePerQuantity) || product?.price?.current || 0;

    return {
      productId: item.productId,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
      title: product?.title ?? 'Unavailable product',
      image: product?.images?.[0] ?? '',
      brand: product?.brand ?? '',
      stock: product?.stock ?? 0,
    };
  }
}
