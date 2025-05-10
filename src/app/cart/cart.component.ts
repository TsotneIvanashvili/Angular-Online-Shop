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
  constructor(public api: CartAreaService) {

  }

  


}
