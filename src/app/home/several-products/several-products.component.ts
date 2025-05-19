import { Component, OnInit } from '@angular/core';
import { ApiAreaService } from '../../services/api-area.service';
import { Product } from '../../../interfaces/product';
import { AllProductArea } from '../../../interfaces/all-product-area';
import { ProductsAreaService } from '../../services/products-area.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-several-products',
  imports: [RouterModule],
  templateUrl: './several-products.component.html',
  styleUrl: './several-products.component.css'
})
export class SeveralProductsComponent implements OnInit {
  constructor(public service: ProductsAreaService) {}
  ngOnInit(): void {
    this.showCards()
  }

  protected productList!: Product[];

  showCards() {
    this.service.getCardsforHome().subscribe({
      next: (data: AllProductArea) => {
       this.productList = data.products
       
        
        
      },
      error: (error) => {
        alert(error)
      },
    })
  }


  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }










  

  // The Code below is not a part of the project,
  public one: number = 1;
  public two: number = 2;
  public three: number = 3;
  public four: number = 4;
  public five: number = 5;
  public six: number = 6;
  public seven: number = 7;
  public eight: number = 8;
  public nine: number = 9;
  public ten: number = 10;
  public eleven: number = 11;
  public twelve: number = 12;
  public thirteen: number = 13;
  public fourteen: number = 14;
  public fifteen: number = 15;
  public sixteen: number = 16;
  public seventeen: number = 17;
  public eighteen: number = 18;
  public nineteen: number = 19;
  public twenty: number = 20;
  public twentyOne: number = 21;
  public twentyTwo: number = 22;
  public twentyThree: number = 23;
  public twentyFour: number = 24;
  public twentyFive: number = 25;
  public twentySix: number = 26;
  public twentySeven: number = 27;
  public twentyEight: number = 28;
  public twentyNine: number = 29;
  public thirty: number = 30;
  public thirtyOne: number = 31;
  public thirtyTwo: number = 32;
  public thirtyThree: number = 33;
  public thirtyFour: number = 34;
  public thirtyFive: number = 35;
  public thirtySix: number = 36;
  public thirtySeven: number = 37;
  public thirtyEight: number = 38;
  public thirtyNine: number = 39;
  public forty: number = 40;
  public fortyOne: number = 41;
  public fortyTwo: number = 42;
  public fortyThree: number = 43;
  public fortyFour: number = 44;
  public fortyFive: number = 45;
  public fortySix: number = 46;
  public fortySeven: number = 47;
  public fortyEight: number = 48;
  public fortyNine: number = 49;
  public fifty: number = 50;
  public fiftyOne: number = 51;
  public fiftyTwo: number = 52;
  public fiftyThree: number = 53;
  public fiftyFour: number = 54;
  public fiftyFive: number = 55;
  public fiftySix: number = 56;
  public fiftySeven: number = 57;
  public fiftyEight: number = 58;
  public fiftyNine: number = 59;
  public sixty: number = 60;
  public sixtyOne: number = 61;
  public sixtyTwo: number = 62;
  public sixtyThree: number = 63;
  public sixtyFour: number = 64;
  public sixtyFive: number = 65;
  public sixtySix: number = 66;
  public sixtySeven: number = 67;
  public sixtyEight: number = 68;
  public sixtyNine: number = 69;
  public seventy: number = 70;
  public seventyOne: number = 71;
  public seventyTwo: number = 72;
  public seventyThree: number = 73;
  public seventyFour: number = 74;
  public seventyFive: number = 75;
  public seventySix: number = 76;
  public seventySeven: number = 77;
  public seventyEight: number = 78;
  public seventyNine: number = 79;
  public eighty: number = 80;
  public eightyOne: number = 81;
  public eightyTwo: number = 82;
  public eightyThree: number = 83;
  public eightyFour: number = 84;
  public eightyFive: number = 85;
  public eightySix: number = 86;
  public eightySeven: number = 87;
  public eightyEight: number = 88;
  public eightyNine: number = 89;
  public ninety: number = 90;
  public ninetyOne: number = 91;
  public ninetyTwo: number = 92;
  public ninetyThree: number = 93;
  public ninetyFour: number = 94;
  public ninetyFive: number = 95;
  public ninetySix: number = 96;
  public ninetySeven: number = 97;
  public ninetyEight: number = 98;
  public ninetyNine: number = 99;
  public oneHundred: number = 100;
  public oneHundredOne: number = 101;
  public oneHundredTwo: number = 102;
  public oneHundredThree: number = 103;         



}
