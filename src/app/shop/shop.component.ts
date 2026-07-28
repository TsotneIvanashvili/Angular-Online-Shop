import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SidebarComponent, ShopFilters, EMPTY_FILTERS } from '../sidebar/sidebar.component';
import { ProductsAreaService } from '../services/products-area.service';
import { Product } from '../../interfaces/product';
import { AllProductArea } from '../../interfaces/all-product-area';
import { FilteredProducts } from '../../interfaces/filtered-products';

import { ProductCardComponent } from '../shared/product-card/product-card.component';
import { ProductSkeletonComponent } from '../shared/product-skeleton/product-skeleton.component';
import { QuickViewComponent } from '../shared/quick-view/quick-view.component';
import {
  GsapRevealDirective,
  GsapSplitDirective,
  GsapMagneticDirective,
} from '../../directives/motion.directives';

interface Category {
  id: string;
  name: string;
  image: string;
}

/** Which endpoint the current view reads from. */
type Source = 'all' | 'category' | 'filter' | 'brand';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    SidebarComponent,
    FormsModule,
    RouterModule,
    ProductCardComponent,
    ProductSkeletonComponent,
    QuickViewComponent,
    GsapRevealDirective,
    GsapSplitDirective,
    GsapMagneticDirective,
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css',
})
export class ShopComponent implements OnInit {
  @ViewChild(SidebarComponent) private sidebar?: SidebarComponent;

  private prodService = inject(ProductsAreaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected categories: Category[] = [];
  protected products: Product[] = [];
  protected loading = true;
  protected failed = false;

  protected currentPage = 1;
  protected pageSize = 12;
  protected total = 0;

  protected source: Source = 'all';
  protected activeCategory: Category | null = null;
  protected filters: ShopFilters = { ...EMPTY_FILTERS };

  protected quickViewProduct: Product | null = null;

  protected readonly pageSizes = [12, 24, 48];

  ngOnInit(): void {
    this.prodService.getCategories().subscribe({
      next: (list: any) => (this.categories = list ?? []),
      error: () => (this.categories = []),
    });

    // A ?q= handed over from the navbar search seeds the keyword filter.
    this.route.queryParams.subscribe((params) => {
      const q = (params['q'] ?? '').toString();
      if (q) {
        this.filters = { ...EMPTY_FILTERS, search: q };
        this.source = 'filter';
        this.sidebar?.setSearchText(q);
      } else {
        this.filters = { ...EMPTY_FILTERS };
        this.source = 'all';
      }
      this.activeCategory = null;
      this.currentPage = 1;
      this.load();
    });
  }

  // ── Data ─────────────────────────────────────────────────

  private load() {
    this.loading = true;
    this.failed = false;

    const done = (data: AllProductArea | FilteredProducts) => {
      this.products = data?.products ?? [];
      this.total = data?.total ?? this.products.length;
      this.loading = false;
    };

    const fail = () => {
      this.products = [];
      this.total = 0;
      this.loading = false;
      this.failed = true;
    };

    if (this.source === 'category' && this.activeCategory) {
      this.prodService
        .getListByCategory(this.activeCategory.id, this.currentPage, this.pageSize)
        .subscribe({ next: done, error: fail });
      return;
    }

    if (this.source === 'brand' && this.filters.brand) {
      this.prodService
        .getExactBrandData(this.filters.brand, this.pageSize)
        .subscribe({ next: done, error: fail });
      return;
    }

    if (this.source === 'filter') {
      this.prodService
        .filterData(
          {
            search: this.filters.search,
            min: this.filters.min,
            max: this.filters.max,
            rating: this.filters.rating,
            sortBy: this.filters.sortBy,
            sortDirection: this.filters.sortDirection,
          },
          this.pageSize,
          this.currentPage
        )
        .subscribe({ next: done, error: fail });
      return;
    }

    this.prodService
      .getCardsOnShopPage(this.currentPage, this.pageSize)
      .subscribe({ next: done, error: fail });
  }

  // ── Filters ──────────────────────────────────────────────

  protected onFilters(filters: ShopFilters) {
    this.filters = filters;
    this.activeCategory = null;
    this.currentPage = 1;

    const hasSearchFilters =
      !!filters.search ||
      filters.min !== null ||
      filters.max !== null ||
      filters.rating !== null ||
      !!filters.sortBy;

    // Brand lives on its own endpoint and can't be combined with the
    // search filters, so it only wins when nothing else is set.
    this.source =
      filters.brand && !hasSearchFilters ? 'brand'
      : hasSearchFilters ? 'filter'
      : 'all';

    this.load();
  }

  protected onFiltersReset() {
    this.filters = { ...EMPTY_FILTERS };
    this.activeCategory = null;
    this.source = 'all';
    this.currentPage = 1;

    if (this.route.snapshot.queryParams['q']) {
      this.router.navigate(['/shop']);
      return;
    }
    this.load();
  }

  protected selectCategory(category: Category) {
    if (this.activeCategory?.id === category.id) {
      this.clearCategory();
      return;
    }
    this.activeCategory = category;
    this.filters = { ...EMPTY_FILTERS };
    this.source = 'category';
    this.currentPage = 1;
    this.load();
  }

  protected clearCategory() {
    this.activeCategory = null;
    this.source = 'all';
    this.currentPage = 1;
    this.load();
  }

  protected changePageSize() {
    this.currentPage = 1;
    this.load();
  }

  // ── Active filter pills ──────────────────────────────────

  protected get activePills(): { label: string; clear: () => void }[] {
    const pills: { label: string; clear: () => void }[] = [];
    const f = this.filters;

    if (this.activeCategory) {
      pills.push({ label: this.activeCategory.name, clear: () => this.clearCategory() });
    }
    if (f.search) {
      pills.push({ label: `“${f.search}”`, clear: () => this.clearFilterKey('search') });
    }
    if (f.brand) {
      pills.push({ label: f.brand, clear: () => this.clearFilterKey('brand') });
    }
    if (f.min !== null || f.max !== null) {
      const label =
        f.min !== null && f.max !== null ? `$${f.min}–$${f.max}`
        : f.min !== null ? `Over $${f.min}`
        : `Under $${f.max}`;
      pills.push({
        label,
        clear: () => {
          this.filters = { ...this.filters, min: null, max: null };
          this.onFilters(this.filters);
        },
      });
    }
    if (f.rating !== null) {
      pills.push({ label: `${f.rating}★ & up`, clear: () => this.clearFilterKey('rating') });
    }
    if (f.sortBy) {
      pills.push({
        label: `Sorted by ${f.sortBy.replace('_', ' ')}`,
        clear: () => this.clearFilterKey('sortBy'),
      });
    }

    return pills;
  }

  private clearFilterKey(key: keyof ShopFilters) {
    const next: ShopFilters = { ...this.filters };
    (next as any)[key] = key === 'rating' ? null : '';
    this.onFilters(next);
  }

  // ── Pagination ───────────────────────────────────────────

  protected get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  /** Windowed page list with ellipses rather than every page number. */
  protected get pageWindow(): (number | '…')[] {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | '…')[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) pages.push('…');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push('…');
    pages.push(total);

    return pages;
  }

  protected goToPage(page: number | '…') {
    if (page === '…' || page === this.currentPage) return;
    this.currentPage = Math.max(1, Math.min(this.totalPages, page));
    this.load();
    this.scrollToTop();
  }

  protected prevPage() { this.goToPage(this.currentPage - 1); }
  protected nextPage() { this.goToPage(this.currentPage + 1); }

  // ── Quick view ───────────────────────────────────────────

  protected openQuickView(product: Product) { this.quickViewProduct = product; }
  protected closeQuickView() { this.quickViewProduct = null; }

  protected hideBrokenImage(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  protected scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
