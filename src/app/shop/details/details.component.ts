import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ProductsAreaService } from '../../services/products-area.service';
import { CommonModule } from '@angular/common';
import { RelatedProdsComponent } from './related-prods/related-prods.component';
import { Product } from '../../../interfaces/product';
import { SignErrComponent } from '../../sign-err/sign-err.component';
import { ToolsService } from '../../services/tools.service';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { ApiAreaService } from '../../services/api-area.service';
import { CartAreaService } from '../../services/cart-area.service';

@Component({
selector: 'app-details',
imports: [CommonModule, RelatedProdsComponent, SignErrComponent],
templateUrl: './details.component.html',
styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
[x: string]: any;
constructor(
public actR: ActivatedRoute,
public service: ProductsAreaService,
public router: Router,
public tools: ToolsService,
public _cookie: SsrCookieService,
public userServ: ApiAreaService,
public CartServ: CartAreaService,
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

addToCart(id: number) {
  
  const prodInfo = {
    id: id,
    quantity: this.prodQuant,
  };

  if (this._cookie.check('userInfo')) {
    this.userServ.profileInfo().subscribe({
      next: (userData) => {
        this.CartServ.updateToCart(prodInfo).subscribe({
          next: (response) => {
              alert("Product Added To Cart!")
          },
          error: (err) => {
            this.CartServ.addToCart(prodInfo).subscribe({
              
              error: (addErr) => {
                console.error("Failed to add to cart:", addErr);
                this.errorSMS(); 
              }
            });
          },
        });
      },
      error: (profileErr) => {
        console.error("Failed to get user profile:", profileErr);
        this.errorSMS(); 
      }
    });
  } else {
    this.errorSMS();
  }
}

ngAfterViewInit(): void {
  this.initParticles();
}

initParticles(): void {
  const canvas = document.getElementById('particles-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: { x: number; y: number; dx: number; dy: number; size: number }[] = [];

  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: (Math.random() - 0.5) * 1,
      dy: (Math.random() - 0.5) * 1,
      size: Math.random() * 3 + 1,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(120, 144, 255, 0.6)';
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}


}

