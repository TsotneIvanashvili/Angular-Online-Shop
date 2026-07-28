import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiAreaService } from '../services/api-area.service';
import { WishlistService } from '../services/wishlist.service';
import { CartStateService } from '../services/cart-state.service';
import {
  GsapRevealDirective,
  GsapSplitDirective,
  GsapSpotlightDirective,
} from '../../directives/motion.directives';

interface Profile {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  zipcode?: string;
  avatar?: string;
  age?: number;
  gender?: string;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    RouterModule,
    GsapRevealDirective,
    GsapSplitDirective,
    GsapSpotlightDirective,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
})
export class ProfilePageComponent implements OnInit {
  private api = inject(ApiAreaService);
  protected wishlist = inject(WishlistService);
  protected cart = inject(CartStateService);

  protected profile: Profile | null = null;
  protected loading = true;
  protected failed = false;

  ngOnInit(): void {
    this.cart.refresh();

    this.api.profileInfo().subscribe({
      next: (data: any) => {
        this.profile = data;
        this.loading = false;
        if (data?._id && typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('userId', data._id);
        }
      },
      error: () => {
        this.profile = null;
        this.loading = false;
        this.failed = true;
      },
    });
  }

  protected get fullName(): string {
    if (!this.profile) return '';
    return [this.profile.firstName, this.profile.lastName].filter(Boolean).join(' ');
  }

  protected get initials(): string {
    const parts = [this.profile?.firstName, this.profile?.lastName].filter(Boolean) as string[];
    return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '—';
  }
}
