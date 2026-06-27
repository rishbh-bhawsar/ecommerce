import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { Order } from '../../models';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatChipsModule, MatIconModule, MatButtonModule, MatPaginatorModule, SkeletonComponent],
  template: `
    <div class="orders-container">
      <h1>
        <mat-icon>receipt_long</mat-icon>
        {{ isAdmin ? 'All Orders' : 'My Orders' }}
      </h1>
      <app-skeleton *ngIf="isLoading" [count]="3"></app-skeleton>
      <div class="orders-list" *ngIf="!isLoading && orders.length > 0">
        <mat-card *ngFor="let order of orders" class="order-card">
          <div class="order-header">
            <div>
              <span class="order-id">Order #{{ order.id }}</span>
              <span class="order-date">{{ order.createdAt | date:'medium' }}</span>
              <span class="order-user" *ngIf="isAdmin && order.user">
                <mat-icon>person</mat-icon> {{ order.user.name }} ({{ order.user.email }})
              </span>
            </div>
            <div class="status-chips">
              <!-- <mat-chip [class]="'status-' + order.status.toLowerCase()">{{ order.status }}</mat-chip> -->
              <mat-chip [class]="'payment-' + order.paymentStatus.toLowerCase()">{{ order.paymentStatus }}</mat-chip>
            </div>
          </div>
          <div class="order-items">
            <div class="order-item" *ngFor="let item of order.items">
              <div class="item-info">
                <img *ngIf="item.product?.image" [src]="previewUrl + item.product.image" class="item-img">
                <div *ngIf="!item.product.image" class="item-initials">{{ item.product.name ? (item.product.name | slice:0:2) : "N/A" }}</div>
                <span>{{ item.product.name }} x {{ item.quantity }}</span>
              </div>
              <span>\${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
          <div class="order-footer">
            <span class="order-total">Total: \${{ order.totalAmount.toFixed(2) }}</span>
            <a mat-button color="primary" [routerLink]="['/orders', order.id]"><mat-icon>visibility</mat-icon> View Details</a>
          </div>
        </mat-card>
      </div>
      <mat-paginator
        *ngIf="!isLoading && totalCount > 0"
        [length]="totalCount"
        [pageSize]="pageSize"
        [pageSizeOptions]="[5, 10, 25]"
        (page)="onPageChange($event)"
        showFirstLastButtons
      ></mat-paginator>
      <div class="no-orders" *ngIf="orders.length === 0 && !isLoading">
        <mat-icon class="no-icon">receipt_long</mat-icon>
        <h2>{{ isAdmin ? 'No orders found' : 'No orders yet' }}</h2>
        <p *ngIf="!isAdmin">Start shopping to see your orders here!</p>
        <a mat-raised-button color="primary" routerLink="/products"><mat-icon>shopping_bag</mat-icon> Browse Products</a>
      </div>
    </div>
  `,
  styles: [`
    .orders-container { max-width: 800px; margin: 0 auto; padding: 24px; }
    .orders-container h1 { display: flex; align-items: center; gap: 8px; color: #333; margin-bottom: 24px; }
    .orders-list { display: flex; flex-direction: column; gap: 16px; }
    .order-card { padding: 20px !important; }
    .order-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .order-id { font-weight: bold; font-size: 1.1em; display: block; }
    .order-date { color: #666; font-size: 13px; display: block; }
    .order-user { display: flex; align-items: center; gap: 4px; color: #3f51b5; font-size: 13px; margin-top: 4px; }
    .order-user mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .status-chips { display: flex; gap: 8px; }
    .order-items { margin-bottom: 16px; }
    .order-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; color: #555; font-size: 14px; }
    .item-info { display: flex; align-items: center; gap: 8px; }
    .item-img { width: 36px; height: 36px; object-fit: cover; border-radius: 4px; }
    .item-initials { width: 36px; height: 36px; background: #e8eaf6; color: #3f51b5; font-weight: bold; font-size: 12px; display: flex; align-items: center; justify-content: center; border-radius: 4px; }
    .order-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 12px; }
    .order-total { font-size: 1.2em; font-weight: bold; color: #3f51b5; }
    .status-pending { background: #ff9800 !important; color: white !important; }
    .status-processing { background: #2196f3 !important; color: white !important; }
    .status-shipped { background: #9c27b0 !important; color: white !important; }
    .status-delivered { background: #4caf50 !important; color: white !important; }
    .status-cancelled { background: #f44336 !important; color: white !important; }
    .payment-pending { background: #ffc107 !important; color: #333 !important; }
    .payment-paid { background: #4caf50 !important; color: white !important; }
    .payment-refunded { background: #ff9800 !important; color: white !important; }
    .payment-failed { background: #f44336 !important; color: white !important; }
    .no-orders { text-align: center; padding: 60px 20px; }
    .no-icon { font-size: 80px; width: 80px; height: 80px; color: #ccc; }
  `]
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  previewUrl = 'http://localhost:3000/uploads/';
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;
  isAdmin = false;

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    const request$ = this.isAdmin
      ? this.orderService.getAllOrders(this.currentPage, this.pageSize)
      : this.orderService.getOrders(this.currentPage, this.pageSize);

    request$.subscribe({
      next: (result) => {
        this.orders = result.orders;
        this.totalCount = result.total;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }
}
