import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ProductsAreaService } from '../../services/products-area.service';
import { CommonModule } from '@angular/common';
import { RelatedProdsComponent } from './related-prods/related-prods.component';
import { Product } from '../../../interfaces/product';
import { SignErrComponent } from '../../sign-err/sign-err.component';
import { ToolsService } from '../../services/tools.service';
import { SsrCookieService } from 'ngx-cookie-service-ssr';

@Component({
  selector: 'app-details',
  imports: [CommonModule, RelatedProdsComponent, SignErrComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  constructor(
    public actR: ActivatedRoute,
    public service: ProductsAreaService,
    public router: Router,
    public tools: ToolsService,
    public _cookie: SsrCookieService
  ) {}

  ngOnInit(): void {
    this.getParam();
    this.getFullInfoProduct(this.prodID);
  }

  public prodID!: string;
  public prodINFO: any;
  public mainImage!: string;
  public allImages!: string[];
  public starNum!: number;
  public prodQuant: number = 1;

  getParam() {
    this.actR.params.subscribe((data: Params) => {
      this.prodID = data['id'];
    });
  }

  otherRelatedArea(pageID: string) {
    this.getFullInfoProduct(pageID);
  }

  getFullInfoProduct(pageID: string) {
    this.service.getProductDetailInfo(pageID).subscribe((data: Product) => {
      this.prodINFO = data;
      this.mainImage = data.images[0];
      this.allImages = data.images;
      this.starNum = Math.round(data.rating);
    });
  }

  zoomImg(currImg: string) {
    this.mainImage = currImg;
  }
  
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  

  increase() {
    this.prodQuant++;
  }

  decrease() {
    this.prodQuant--;
  }

  errorSMS() {
    this.tools.isErrSMS.next(true);
  }

  addToCart() {
    alert('addedd');
  }

  createAndAddCart() {
    alert('created and added');
  }

  cartBTN() {
    if (this._cookie.check('userInfo')) {
      if (this._cookie.get('cartInfo') != '') {
        this.addToCart();
      } else {
        this.createAndAddCart();
      }
    } else {
      this.errorSMS();
    }
  }
}
