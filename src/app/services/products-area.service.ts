import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AllProductArea } from '../../interfaces/all-product-area';
import { FilteredProducts } from '../../interfaces/filtered-products';
import { Product } from '../../interfaces/product';

const API = 'https://api.everrest.educata.dev/shop/products';

export interface ProductFilters {
  search?: string;
  min?: number | null;
  max?: number | null;
  rating?: number | null;
  sortBy?: string;
  sortDirection?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsAreaService {
  constructor(public http: HttpClient) {}

  getCategories() {
    return this.http.get(`${API}/categories`);
  }

  getListByCategory(id: any, page: any, size: any) {
    return this.http.get<AllProductArea>(
      `${API}/category/${id}?page_index=${page}&page_size=${size}`
    );
  }

  getBrands() {
    return this.http.get<string[]>(`${API}/brands`);
  }

  getExactBrandData(name: string, size: number = 12) {
    return this.http.get<AllProductArea>(
      `${API}/brand/${encodeURIComponent(name)}?page_size=${size}`
    );
  }

  getSearchedData(searchInput: string, size: number) {
    const params = new HttpParams()
      .set('page_size', size)
      .set('keywords', searchInput);

    return this.http.get<FilteredProducts>(`${API}/search`, { params });
  }

  /**
   * Builds the search query from whichever filters are actually set.
   * Empty values are omitted entirely rather than sent as blanks, which
   * the API treats as "match nothing" on some fields.
   */
  filterData(filters: ProductFilters, size: number, page: number = 1) {
    let params = new HttpParams()
      .set('page_size', size)
      .set('page_index', page);

    if (filters.search?.trim()) params = params.set('keywords', filters.search.trim());
    if (filters.rating != null) params = params.set('rating', filters.rating);
    if (filters.min != null) params = params.set('price_min', filters.min);
    if (filters.max != null) params = params.set('price_max', filters.max);
    if (filters.sortBy) params = params.set('sort_by', filters.sortBy);
    if (filters.sortDirection) params = params.set('sort_direction', filters.sortDirection);

    return this.http.get<FilteredProducts>(`${API}/search`, { params });
  }

  getCardsforHome(size: number = 8) {
    return this.http.get<AllProductArea>(`${API}/all?page_size=${size}`);
  }

  getCardsOnShopPage(page: any, size: any) {
    return this.http.get<AllProductArea>(
      `${API}/all?page_index=${page}&page_size=${size}`
    );
  }

  getProductDetailInfo(id: string) {
    return this.http.get<Product>(`${API}/id/${id}`);
  }
}
