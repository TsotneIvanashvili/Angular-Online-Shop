import { Component, OnInit } from '@angular/core';
import { ApiAreaService } from '../services/api-area.service';
import { HttpHeaders } from '@angular/common/http';
import { ProductsAreaService } from '../services/products-area.service';
import { CartAreaService } from '../services/cart-area.service';

@Component({
    selector: 'app-cart',
    imports: [],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.css'
})
export class CartComponent   {
  constructor(public api: CartAreaService,   public productService: ProductsAreaService) {
    this.getCart()
  }

  public cart: any[] = []

getCart() {
  this.api.getCart().subscribe((data: any) => {
    const cartItems = data.products;

    const enrichedCartItems: any[] = [];

    cartItems.forEach((item: any) => {
      this.productService.getProductDetailInfo(item.productId).subscribe((productData: any) => {
        enrichedCartItems.push({
          ...item,
          title: productData.title,
          image: productData.images[0] || '', // first image
        });
      });
    });

    this.cart = enrichedCartItems;
  });
}


updateQuantity(productId: string, newQuantity: number) {
  if (newQuantity < 1) return;

  const body = {
    id: productId,
    quantity: newQuantity,
  };

  this.api.updateToCart(body).subscribe(() => {
    this.getCart(); // Refresh cart
  });
}

deleteProduct(productId: string) {
  const body = {
    id: productId,
  };

  this.api.deleteProduct(body).subscribe(() => {
    this.getCart(); // Refresh cart
  });
}



}
