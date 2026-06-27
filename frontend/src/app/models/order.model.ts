import { User } from './user.model';

export interface OrderProduct {
  id: number;
  name: string;
  price: number;
  image: string | null;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: OrderProduct;
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  items: OrderItem[];
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export interface CheckoutRequest {
  shippingAddress: Address;
  paymentMethod: string;
  items: { productId: number; quantity: number }[];
}
