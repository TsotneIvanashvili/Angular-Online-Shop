import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ProductsAreaService } from '../services/products-area.service';
import { AllProductArea } from '../../interfaces/all-product-area';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  imports: [FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  constructor(public productApi: ProductsAreaService) {}

  @Output() sendBrands: EventEmitter<AllProductArea> = new EventEmitter();
  @Output() sendAllProducts: EventEmitter<AllProductArea> = new EventEmitter();
  @Output() sendCategoryData: EventEmitter<AllProductArea> = new EventEmitter();
  @Output() sendFilterData: EventEmitter<Object> = new EventEmitter();
  @Output() sendSearchInfo: EventEmitter<string> = new EventEmitter();

  public searchText: string = '';
  public minPrice: string = '';
  public maxPrice: string = '';
  public rating!: number;
  public sort: string = '';
  public type: string = '';
  public activeBrand: string = 'All';
  protected brands: string[] = [];
  ngOnInit(): void {
    this.getBrandsList();
  }

  searchData() {
    this.sendSearchInfo.emit(this.searchText);
  }

  filterData() {
    const min = this.minPrice !== '' ? Number(this.minPrice) : undefined;
    const max = this.maxPrice !== '' ? Number(this.maxPrice) : undefined;

    if ((min !== undefined && isNaN(min)) || (max !== undefined && isNaN(max))) {
      return;
    }
    this.sendFilterData.emit({
      search: this.searchText,
      min,
      max,
      rating: this.rating,
      type: this.type,
      sort: this.sort,
      brand: this.activeBrand !== 'All' ? this.activeBrand : undefined
    });
  }

  showAll() {
    this.activeBrand = 'All';
    this.productApi.getCardsOnShopPage(1, 15).subscribe((data: AllProductArea) => {
        this.sendAllProducts.emit(data);
      });
  }

  getBrandsList() {
    this.productApi.getBrands().subscribe((list: string[]) => {
      this.brands = list;
    });
  }

  getBrandData(brand: string) {
    this.activeBrand = brand;
    this.productApi
      .getExactBrandData(brand)
      .subscribe((data: AllProductArea) => {
        this.sendBrands.emit(data);
      });
  }

  onBrandChange(event: Event) {
    if (this.activeBrand === 'All') {
      this.showAll();
    } else {
      this.getBrandData(this.activeBrand);
    }
  }
}
