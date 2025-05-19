import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartAreaService {

  constructor(public http: HttpClient) { }

  getCart() {
    return this.http.get('https://api.everrest.educata.dev/shop/cart');
  }

  addToCart(body: any) {
    return this.http.post('https://api.everrest.educata.dev/shop/cart/product', body);
  }

  updateToCart(body: any) {
    return this.http.patch('https://api.everrest.educata.dev/shop/cart/product', body);
  }

  deleteProduct(body: any) {
    return this.http.delete('https://api.everrest.educata.dev/shop/cart/product', { body: body });
  }

  
}
