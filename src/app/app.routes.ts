import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { CartComponent } from './cart/cart.component';
import { ShopComponent } from './shop/shop.component';
import { DetailsComponent } from './shop/details/details.component';


export const routes: Routes = [
    {path: "", component: HomeComponent},
    {path: "profile", component: ProfilePageComponent},
    {path: "cart", component: CartComponent},
    {path: "shop", component: ShopComponent},
    {path: "details/:id", component: DetailsComponent}
];
