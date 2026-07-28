import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { ShopComponent } from './shop/shop.component';
import { DetailsComponent } from './shop/details/details.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { ErrorComponent } from './error/error.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'TechStore — Laptops, components & gear' },
  { path: 'shop', component: ShopComponent, title: 'Shop — TechStore' },
  { path: 'details/:id', component: DetailsComponent, title: 'Product — TechStore' },
  { path: 'cart', component: CartComponent, title: 'Your cart — TechStore' },
  { path: 'checkout', component: CheckoutComponent, title: 'Checkout — TechStore' },
  { path: 'wishlist', component: WishlistComponent, title: 'Wishlist — TechStore' },
  { path: 'profile', component: ProfilePageComponent, title: 'Your account — TechStore' },
  { path: 'register', component: SignUpComponent, title: 'Create an account — TechStore' },
  { path: 'Signin', component: SignInComponent, title: 'Sign in — TechStore' },
  { path: '**', component: ErrorComponent, title: 'Page not found — TechStore' },
];
