import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductsAreaService } from '../services/products-area.service';

export interface ShopFilters {
  search: string;
  min: number | null;
  max: number | null;
  rating: number | null;
  sortBy: string;
  sortDirection: string;
  brand: string;
}

export const EMPTY_FILTERS: ShopFilters = {
  search: '',
  min: null,
  max: null,
  rating: null,
  sortBy: '',
  sortDirection: '',
  brand: '',
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  private productApi = inject(ProductsAreaService);

  @Output() filtersChange = new EventEmitter<ShopFilters>();
  @Output() filtersReset = new EventEmitter<void>();

  protected brands: string[] = [];
  protected loadingBrands = true;

  protected searchText = '';
  protected minPrice: number | null = null;
  protected maxPrice: number | null = null;
  protected rating: number | null = null;
  protected sortBy = '';
  protected sortDirection = 'asc';
  protected activeBrand = '';

  protected readonly ratingOptions = [4, 3, 2, 1];
  protected readonly pricePresets = [
    { label: 'Under $100', min: null, max: 100 },
    { label: '$100 – $500', min: 100, max: 500 },
    { label: '$500 – $1,500', min: 500, max: 1500 },
    { label: '$1,500+', min: 1500, max: null },
  ];

  ngOnInit(): void {
    this.productApi.getBrands().subscribe({
      next: (list) => {
        this.brands = list ?? [];
        this.loadingBrands = false;
      },
      error: () => {
        this.brands = [];
        this.loadingBrands = false;
      },
    });
  }

  protected setRating(value: number) {
    this.rating = this.rating === value ? null : value;
    this.apply();
  }

  protected setPreset(preset: { min: number | null; max: number | null }) {
    const alreadyOn = this.minPrice === preset.min && this.maxPrice === preset.max;
    this.minPrice = alreadyOn ? null : preset.min;
    this.maxPrice = alreadyOn ? null : preset.max;
    this.apply();
  }

  protected isPreset(preset: { min: number | null; max: number | null }): boolean {
    return this.minPrice === preset.min && this.maxPrice === preset.max;
  }

  protected apply() {
    this.filtersChange.emit({
      search: this.searchText.trim(),
      min: this.normalise(this.minPrice),
      max: this.normalise(this.maxPrice),
      rating: this.rating,
      sortBy: this.sortBy,
      sortDirection: this.sortBy ? this.sortDirection : '',
      brand: this.activeBrand,
    });
  }

  protected reset() {
    this.searchText = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.rating = null;
    this.sortBy = '';
    this.sortDirection = 'asc';
    this.activeBrand = '';
    this.filtersReset.emit();
  }

  /** Applies external state (e.g. a ?q= search) without re-emitting. */
  setSearchText(value: string) {
    this.searchText = value;
  }

  private normalise(value: number | null): number | null {
    if (value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }
}
