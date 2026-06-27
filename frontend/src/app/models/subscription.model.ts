import { User } from './user.model';

export interface Price {
  id: number;
  stripePriceId: string;
  name: string;
  nickname: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  intervalCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subscription {
  id: number;
  userId: number;
  priceId: number;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'unpaid';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  canceledAt?: string;
  price?: Price;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePriceRequest {
  stripePriceId: string;
  name: string;
  nickname: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  intervalCount: number;
}

export interface CreateSubscriptionRequest {
  priceId: number;
  paymentMethodId?: string;
}
