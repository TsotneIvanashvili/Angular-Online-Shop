import { Product } from "./product";

export interface FilteredProducts {
  total: number;
  limit: number;
  page: number;
  sortedBy: string;
  sortedDirection: string;
  skip: number;
  products: Product[];
}
