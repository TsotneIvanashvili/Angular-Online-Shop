import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { CartComponent } from './cart/cart.component';
import { ShopComponent } from './shop/shop.component';
import { DetailsComponent } from './shop/details/details.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { ErrorComponent } from './error/error.component';


export const routes: Routes = [
    {path: "", component: HomeComponent},
    {path: "profile", component: ProfilePageComponent},
    {path: "cart", component: CartComponent},
    {path: "shop", component: ShopComponent},
    {path: "details/:id", component: DetailsComponent},
    {path: "register", component: SignUpComponent},
    {path: "Signin", component: SignInComponent},
    { path: '**', component: ErrorComponent },
];
