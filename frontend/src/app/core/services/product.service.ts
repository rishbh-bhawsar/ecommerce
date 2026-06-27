import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Product } from '../../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API_URL = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  getProducts(page = 1, pageSize = 12, category?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<any>(this.API_URL, { params }).pipe(
      map(res => {
        const data = res.data || res;
        if (data.products) {
          data.products = data.products.map((p: any) => this.normalizeProduct(p));
        }
        return data;
      }),
      catchError(this.handleError)
    );
  }

  getProductById(id: string | number): Observable<Product> {
    return this.http.get<any>(`${this.API_URL}/${id}`).pipe(
      map(res => this.normalizeProduct(res.data?.product || res.data || res)),
      catchError(this.handleError)
    );
  }

  createProduct(formData: FormData): Observable<any> {
    return this.http.post<any>(this.API_URL, formData).pipe(
      map(res => res.data || res),
      catchError(this.handleError)
    );
  }

  updateProduct(id: number, data: FormData | Partial<Product>): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${id}`, data).pipe(
      map(res => res.data || res),
      catchError(this.handleError)
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<any>(`${this.API_URL}/${id}`).pipe(
      map(res => res.data || res),
      catchError(this.handleError)
    );
  }

  private normalizeProduct(p: any): Product {
    return {
      ...p,
      price: Number(p.price),
      image: p.image ? `http://localhost:3000/uploads/${p.image}` : null
    };
  }

  private handleError(error: any): Observable<never> {
    const message = error.error?.message || 'An error occurred';
    return throwError(() => new Error(message));
  }
}
