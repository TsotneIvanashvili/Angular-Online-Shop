import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Product } from '../../../interfaces/product';
import { AllProductArea } from '../../../interfaces/all-product-area';
import { ProductsAreaService } from '../../services/products-area.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ProductSkeletonComponent } from '../../shared/product-skeleton/product-skeleton.component';
import { QuickViewComponent } from '../../shared/quick-view/quick-view.component';
import { GsapRevealDirective } from '../../../directives/motion.directives';

@Component({
  selector: 'app-several-products',
  standalone: true,
  imports: [
    RouterModule,
    ProductCardComponent,
    ProductSkeletonComponent,
    QuickViewComponent,
    GsapRevealDirective,
  ],
  templateUrl: './several-products.component.html',
  styleUrl: './several-products.component.css',
})
export class SeveralProductsComponent implements OnInit {
  private service = inject(ProductsAreaService);

  protected productList: Product[] = [];
  protected loading = true;
  protected failed = false;
  protected quickViewProduct: Product | null = null;

  ngOnInit(): void {
    this.showCards();
  }

  showCards() {
    this.loading = true;
    this.failed = false;

    this.service.getCardsforHome(8).subscribe({
      next: (data: AllProductArea) => {
        this.productList = data?.products ?? [];
        this.loading = false;
      },
      error: () => {
        this.productList = [];
        this.loading = false;
        this.failed = true;
      },
    });
  }

  protected openQuickView(product: Product) { this.quickViewProduct = product; }
  protected closeQuickView() { this.quickViewProduct = null; }
}
