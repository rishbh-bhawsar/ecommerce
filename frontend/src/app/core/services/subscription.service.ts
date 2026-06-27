import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import {
  Price,
  Subscription,
  CreatePriceRequest,
  CreateSubscriptionRequest,
} from '../../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly API_URL = 'http://localhost:3000/api/subscriptions';

  constructor(private http: HttpClient) {}

  getAllPrices(): Observable<Price[]> {
    return this.http.get<any>(`${this.API_URL}/prices`).pipe(
      map(res => res.data?.prices || res.data || []),
      catchError(this.handleError)
    );
  }

  getPriceById(id: number): Observable<Price> {
    return this.http.get<any>(`${this.API_URL}/prices/${id}`).pipe(
      map(res => res.data?.price || res.data),
      catchError(this.handleError)
    );
  }

  createPrice(data: CreatePriceRequest): Observable<Price> {
    return this.http.post<any>(`${this.API_URL}/prices`, data).pipe(
      map(res => res.data?.price || res.data),
      catchError(this.handleError)
    );
  }

  updatePrice(id: number, data: Partial<CreatePriceRequest>): Observable<Price> {
    return this.http.put<any>(`${this.API_URL}/prices/${id}`, data).pipe(
      map(res => res.data?.price || res.data),
      catchError(this.handleError)
    );
  }

  deletePrice(id: number): Observable<void> {
    return this.http.delete<any>(`${this.API_URL}/prices/${id}`).pipe(
      map(() => undefined),
      catchError(this.handleError)
    );
  }

  createSubscription(data: CreateSubscriptionRequest): Observable<Subscription> {
    return this.http.post<any>(this.API_URL, data).pipe(
      map(res => res.data?.subscription || res.data),
      catchError(this.handleError)
    );
  }

  getMySubscriptions(): Observable<Subscription[]> {
    return this.http.get<any>(`${this.API_URL}/my`).pipe(
      map(res => res.data?.subscriptions || res.data || []),
      catchError(this.handleError)
    );
  }

  getAllSubscriptions(): Observable<Subscription[]> {
    return this.http.get<any>(`${this.API_URL}/all`).pipe(
      map(res => res.data?.subscriptions || res.data || []),
      catchError(this.handleError)
    );
  }

  cancelSubscription(id: number): Observable<Subscription> {
    return this.http.put<any>(`${this.API_URL}/${id}/cancel`, {}).pipe(
      map(res => res.data?.subscription || res.data),
      catchError(this.handleError)
    );
  }

  immediateCancelSubscription(id: number): Observable<Subscription> {
    return this.http.put<any>(`${this.API_URL}/${id}/immediate-cancel`, {}).pipe(
      map(res => res.data?.subscription || res.data),
      catchError(this.handleError)
    );
  }

  getSubscriptionHistory(): Observable<Subscription[]> {
    return this.http.get<any>(`${this.API_URL}/history`).pipe(
      map(res => res.data?.history || res.data || []),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    const message = error.error?.message || 'An error occurred';
    return throwError(() => new Error(message));
  }
}
