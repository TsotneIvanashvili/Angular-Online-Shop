import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, Subscription, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
} from 'rxjs/operators';
import { SsrCookieService } from 'ngx-cookie-service-ssr';

import { ScrollingDirective } from '../../directives/scrolling.directive';
import { ToolsService } from '../services/tools.service';
import { CartStateService } from '../services/cart-state.service';
import { WishlistService } from '../services/wishlist.service';
import { ProductsAreaService } from '../services/products-area.service';
import { Product } from '../../interfaces/product';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ScrollingDirective, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  protected cart = inject(CartStateService);
  protected wishlist = inject(WishlistService);
  private products = inject(ProductsAreaService);
  private router = inject(Router);

  constructor(public _cookie: SsrCookieService, public tools: ToolsService) {}

  public isLoggedIn = false;
  public isMenuOpen = false;
  public userImg: string | null = null;
  public userName: string | null = null;

  protected searchTerm = '';
  protected suggestions: Product[] = [];
  protected searching = false;
  protected showSuggestions = false;

  private search$ = new Subject<string>();
  private subs = new Subscription();

  ngOnInit(): void {
    if (typeof sessionStorage !== 'undefined') {
      this.userImg = sessionStorage.getItem('userAvatar');
      this.userName = sessionStorage.getItem('userName');
    }
    this.isLoggedIn = !!this.userName;

    this.cart.refresh();

    this.subs.add(
      this.search$
        .pipe(
          debounceTime(280),
          distinctUntilChanged(),
          filter((term) => term.trim().length >= 2),
          switchMap((term) =>
            this.products
              .getSearchedData(term.trim(), 6)
              .pipe(catchError(() => of({ products: [] as Product[] } as any)))
          )
        )
        .subscribe((data: any) => {
          this.suggestions = data?.products ?? [];
          this.searching = false;
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.unlockScroll();
  }

  // ── Search ───────────────────────────────────────────────

  onSearchInput() {
    this.showSuggestions = true;

    if (this.searchTerm.trim().length < 2) {
      this.suggestions = [];
      this.searching = false;
      return;
    }

    this.searching = true;
    this.search$.next(this.searchTerm);
  }

  submitSearch() {
    const term = this.searchTerm.trim();
    if (!term) return;
    this.closeSuggestions();
    this.closeMenu();
    this.router.navigate(['/shop'], { queryParams: { q: term } });
  }

  pickSuggestion(id: string) {
    this.closeSuggestions();
    this.closeMenu();
    this.searchTerm = '';
    this.suggestions = [];
    this.router.navigate(['/details', id]);
  }

  clearSearch() {
    this.searchTerm = '';
    this.suggestions = [];
    this.showSuggestions = false;
  }

  closeSuggestions() {
    this.showSuggestions = false;
  }

  // ── Menu ─────────────────────────────────────────────────

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest('.search')) this.closeSuggestions();

    if (
      this.isMenuOpen &&
      window.innerWidth <= 960 &&
      !target.closest('.nav__panel') &&
      !target.closest('.burger')
    ) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeSuggestions();
    if (this.isMenuOpen) this.closeMenu();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.unlockScroll();
  }

  signOut() {
    this._cookie.deleteAll();
    sessionStorage.clear();
    this.isLoggedIn = false;
    this.userImg = null;
    this.userName = null;
    this.cart.lines.set([]);
    this.closeMenu();
  }

  private unlockScroll() {
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  }
}
