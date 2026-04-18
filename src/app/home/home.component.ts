import { Component, OnInit } from '@angular/core';
import { ApiAreaService } from '../services/api-area.service';
import { SeveralProductsComponent } from "./several-products/several-products.component";
import { RouterModule } from '@angular/router';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
    selector: 'app-home',
    imports: [SeveralProductsComponent, RouterModule, RevealDirective],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  constructor(public api: ApiAreaService) {}

  rawImages: string[] = [
    'https://cdn.mos.cms.futurecdn.net/v2/t:0,l:0,cw:2000,ch:1125,q:80,w:2000/sJUAmbBLMmhEPcMqtQGGGg.jpg',
    'https://dlcdnrog.asus.com/rog/media/1546895302493.webp',
    'https://wallpapercat.com/w/full/8/4/3/896207-3840x2160-desktop-4k-laptop-wallpaper.jpg',
    'https://in.aorus.com/upload/Product/F_20220104171438Ap71093.JPG',
    'https://images6.alphacoders.com/133/1338694.png'
  ];

  get loopImages(): string[] {
    return [...this.rawImages, ...this.rawImages];
  }

  ngOnInit(): void {}

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
