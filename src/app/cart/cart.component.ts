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
export class CartComponent implements OnInit {
  constructor(private api: CartAreaService) {}
  ngOnInit(): void {
    // this.createCart()
    // this.getCart()
  }

  private productId:any;
  private token = sessionStorage.getItem("token")
 

  createCart() {

    const cartData = {
      id: this.productId,
      quantity: 1
    }
    
    this.api.createCart(cartData,).subscribe({
      next: (data:any) => {
        console.log(data);
        
      },
      error: (err) => {
        console.log(err);
        
      }
    })
  }

  // getCart() {
  //   this.api.getCart().subscribe({
  //     next: (data:any) => {
  //       console.log(data);
        
  //     },
  //     error: (err) => {
  //       console.log(err);
        
  //     }
  //   })
  // }

}
