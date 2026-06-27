import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  description?: string;
  productCount?: number;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly API_URL = 'http://localhost:3000/api/categories';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<any>(this.API_URL).pipe(
      map(res => res.data?.categories || res.data || res),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    const message = error.error?.message || 'An error occurred';
    return throwError(() => new Error(message));
  }
}
