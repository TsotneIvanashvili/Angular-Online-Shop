import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ProductsAreaService } from '../../../services/products-area.service';
import { RouterModule } from '@angular/router';
import { Product } from '../../../../interfaces/product';
import { AllProductArea } from '../../../../interfaces/all-product-area';

@Component({
  selector: 'app-related-prods',
  imports: [RouterModule],
  templateUrl: './related-prods.component.html',
  styleUrl: './related-prods.component.css',
})
export class RelatedProdsComponent implements OnInit {
  constructor(public serv: ProductsAreaService) {}
  @Input() public categoryID: string | undefined;
  @Output() public otherRelated: EventEmitter<any> = new EventEmitter();
  public relatedProds: Product[] = [];
  public altImage: string =
    'https://media.istockphoto.com/id/1396814518/vector/image-coming-soon-no-photo-no-thumbnail-image-available-vector-illustration.jpg?s=612x612&w=0&k=20&c=hnh2OZgQGhf0b46-J2z7aHbIWwq8HNlSDaNp2wn_iko=';

  ngOnInit(): void {
    this.getRelatedProds();
  }

  otherRelatedPage(id: string) {
    this.otherRelated.emit(id);
  }

  getRelatedProds() {
    this.serv
      .getListByCategory(this.categoryID, 1, 5)
      .subscribe((data: AllProductArea) => {
        let filtered = data.products.filter(
          (item: any) => item._id != this.categoryID
        );

        this.relatedProds = filtered;
      });
  }
}
