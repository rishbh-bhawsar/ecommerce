import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { Order, CheckoutRequest } from '../../models';

export interface PaginatedOrders {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly API_URL = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient) {}

  getOrders(page: number = 1, limit: number = 10, status?: string): Observable<PaginatedOrders> {
    let url = `${this.API_URL}/my-orders?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return this.http.get<any>(url).pipe(
      map(res => this.extractPaginated(res, page, limit)),
      catchError(this.handleError)
    );
  }

  getAllOrders(page: number = 1, limit: number = 10, status?: string): Observable<PaginatedOrders> {
    let url = `${this.API_URL}/all?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return this.http.get<any>(url).pipe(
      map(res => this.extractPaginated(res, page, limit)),
      catchError(this.handleError)
    );
  }

  getOrderById(id: string | number): Observable<Order> {
    return this.http.get<any>(`${this.API_URL}/${id}`).pipe(
      map(res => this.normalizeOrder(res.data?.order || res.data)),
      catchError(this.handleError)
    );
  }

  createOrder(data: CheckoutRequest): Observable<Order> {
    return this.http.post<any>(this.API_URL, data).pipe(
      map(res => this.normalizeOrder(res.data?.order || res.data)),
      catchError(this.handleError)
    );
  }

  updateOrderStatus(id: string | number, status: string): Observable<Order> {
    return this.http.put<any>(`${this.API_URL}/${id}/status`, { status }).pipe(
      map(res => this.normalizeOrder(res.data?.order || res.data)),
      catchError(this.handleError)
    );
  }

  createCheckoutSession(data: any): Observable<any> {
    return this.http.post<any>(this.API_URL + '/checkout', data).pipe(
      map(res => this.normalizeOrder(res)),
      catchError(this.handleError)
    );
  }

  private extractPaginated(res: any, page: number, limit: number): PaginatedOrders {
    const data = res.data || {};
    return {
      orders: this.normalizeOrders(data.orders || []),
      total: data.pagination?.total || 0,
      page: data.pagination?.page || page,
      limit: data.pagination?.limit || limit,
      totalPages: data.pagination?.totalPages || 0,
    };
  }

  private normalizeOrders(orders: any[]): Order[] {
    return (orders || []).map(o => this.normalizeOrder(o));
  }

  private normalizeOrder(order: any): Order {
    if (!order) return order;
    return {
      ...order,
      totalAmount: Number(order.totalAmount) || 0,
      items: (order.items || []).map((item: any) => ({
        ...item,
        price: Number(item.price) || 0,
        product: item.product ? { ...item.product, price: Number(item.product?.price) || 0 } : item.product
      }))
    };
  }

  private handleError(error: any): Observable<never> {
    const message = error.error?.message || 'An error occurred';
    return throwError(() => new Error(message));
  }
}
