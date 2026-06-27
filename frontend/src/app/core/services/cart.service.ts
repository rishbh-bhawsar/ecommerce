import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, throwError, tap, map, filter } from 'rxjs';
import { Cart, CartItem } from '../../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly API_URL = 'http://localhost:3000/api/cart';
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<any>(this.API_URL).pipe(
      map(res => this.normalizeCart(res.data?.cart, res.data?.totalAmount)),
      filter((cart): cart is Cart => cart !== null),
      tap(cart => this.cartSubject.next(cart)),
      catchError(this.handleError)
    );
  }

  addToCart(productId: number, quantity = 1): Observable<Cart> {
    return this.http.post<any>(this.API_URL + "/add", { productId, quantity }).pipe(
      map(res => {
        const cartData = res.data?.cart || res.data;
        const total = res.data?.totalAmount;
        if (!cartData) {
          return this.cartSubject.value || { id: 0, userId: 0, total: 0, items: [] } as Cart;
        }
        return this.normalizeCart(cartData, total)!;
      }),
      tap(cart => this.cartSubject.next(cart)),
      catchError(this.handleError)
    );
  }

  updateCartItem(productId: number, quantity: number): Observable<Cart> {
    return this.http.put<any>(`${this.API_URL}/${productId}`, { quantity }).pipe(
      map(res => this.normalizeCart(res.data?.cart || res.data, res.data?.totalAmount)),
      filter((cart): cart is Cart => cart !== null),
      tap(cart => this.cartSubject.next(cart)),
      catchError(this.handleError)
    );
  }

  removeFromCart(productId: number): Observable<Cart> {
    return this.http.delete<any>(`${this.API_URL}/${productId}`).pipe(
      map(res => this.normalizeCart(res.data?.cart || res.data, res.data?.totalAmount)),
      filter((cart): cart is Cart => cart !== null),
      tap(cart => this.cartSubject.next(cart)),
      catchError(this.handleError)
    );
  }

  clearCart(): void {
    this.cartSubject.next(null);
  }

  getCartItemCount(): number {
    const cart = this.cartSubject.value;
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  private normalizeCart(cartData: any, totalAmount?: number): Cart | null {
    if (!cartData) return null;
    return {
      ...cartData,
      total: totalAmount ?? cartData.total ?? 0,
      items: (cartData.items || []).map((item: any) => ({
        ...item,
        product: { ...item.product, price: Number(item.product?.price) || 0 }
      }))
    };
  }

  private handleError(error: any): Observable<never> {
    const message = error.error?.message || 'An error occurred';
    return throwError(() => new Error(message));
  }
}
