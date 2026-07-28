import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../../interfaces/product';

export interface WishlistItem {
  id: string;
  title: string;
  image: string;
  price: number;
  beforeDiscount: number;
  brand: string;
  rating: number;
  stock: number;
}

const STORAGE_KEY = 'techstore.wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  readonly items = signal<WishlistItem[]>(this.read());
  readonly count = computed(() => this.items().length);

  constructor() {
    this.items.set(this.read());
  }

  has(id: string): boolean {
    return this.items().some((i) => i.id === id);
  }

  /** Returns true when the product ended up saved, false when it was removed. */
  toggle(product: Product): boolean {
    if (this.has(product._id)) {
      this.remove(product._id);
      return false;
    }
    this.items.update((list) => [...list, this.fromProduct(product)]);
    this.persist();
    return true;
  }

  remove(id: string) {
    this.items.update((list) => list.filter((i) => i.id !== id));
    this.persist();
  }

  clear() {
    this.items.set([]);
    this.persist();
  }

  private fromProduct(p: Product): WishlistItem {
    return {
      id: p._id,
      title: p.title,
      image: p.images?.[0] ?? '',
      price: p.price?.current ?? 0,
      beforeDiscount: p.price?.beforeDiscount ?? 0,
      brand: p.brand ?? '',
      rating: p.rating ?? 0,
      stock: p.stock ?? 0,
    };
  }

  private read(): WishlistItem[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
    } catch {
      return [];
    }
  }

  private persist() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
    } catch {
      /* storage full or blocked — the in-memory list still works */
    }
  }
}
