import { Product } from './product';

export interface AllProductArea {
  total: number;
  limit: number;
  page: number;
  skip: number;
  products: Product[];
}
