import { Product } from './product.model';

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
  createdAt?: string;
  updatedAt?: string;
}
