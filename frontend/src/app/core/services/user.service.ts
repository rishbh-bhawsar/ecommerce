import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { User } from '../../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API_URL = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<any>(this.API_URL).pipe(
      map(res => res.data?.users || res.data || []),
      catchError(this.handleError)
    );
  }


  getUsersCount(): Observable<any> {
    return this.http.get<any>(this.API_URL+"/count").pipe(
      map(res => res.data?.users || res.data || {}),
      catchError(this.handleError)
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<any>(`${this.API_URL}/${id}`).pipe(
      map(res => res.data?.user || res.data),
      catchError(this.handleError)
    );
  }

  updateUser(id: string | number, data: Partial<User>): Observable<User> {
    return this.http.put<any>(`${this.API_URL}/${id}`, data).pipe(
      map(res => res.data?.user || res.data),
      catchError(this.handleError)
    );
  }

  deleteUser(id: string | number): Observable<void> {
    return this.http.delete<any>(`${this.API_URL}/${id}`).pipe(
      map(() => undefined),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    const message = error.error?.message || 'An error occurred';
    return throwError(() => new Error(message));
  }
}
