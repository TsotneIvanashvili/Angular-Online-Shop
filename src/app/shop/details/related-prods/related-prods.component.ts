import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { ProductsAreaService } from '../../../services/products-area.service';
import { Product } from '../../../../interfaces/product';
import { AllProductArea } from '../../../../interfaces/all-product-area';
import { ProductCardComponent } from '../../../shared/product-card/product-card.component';
import { ProductSkeletonComponent } from '../../../shared/product-skeleton/product-skeleton.component';

@Component({
  selector: 'app-related-prods',
  standalone: true,
  imports: [ProductCardComponent, ProductSkeletonComponent],
  templateUrl: './related-prods.component.html',
  styleUrl: './related-prods.component.css',
})
export class RelatedProdsComponent implements OnChanges {
  private serv = inject(ProductsAreaService);

  @Input() categoryID: string | undefined;
  /** The product being viewed, so it isn't listed as related to itself. */
  @Input() excludeID: string | undefined;

  @Output() otherRelated = new EventEmitter<string>();

  protected products: Product[] = [];
  protected loading = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryID'] || changes['excludeID']) {
      this.loadRelated();
    }
  }

  /**
   * Pulls from the product's own category. The previous version called
   * the homepage endpoint, so "related" products were just the newest
   * items in the store regardless of what you were looking at.
   */
  private loadRelated() {
    if (!this.categoryID) {
      this.products = [];
      this.loading = false;
      return;
    }

    this.loading = true;

    this.serv.getListByCategory(this.categoryID, 1, 6).subscribe({
      next: (data: AllProductArea) => {
        this.products = (data?.products ?? [])
          .filter((p) => p._id !== this.excludeID)
          .slice(0, 4);
        this.loading = false;
      },
      error: () => {
        this.products = [];
        this.loading = false;
      },
    });
  }

  protected select(id: string) {
    this.otherRelated.emit(id);
  }
}
