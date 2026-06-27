import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductService } from '../../../core/services/product.service';
import { UserService } from '../../../core/services/user.service';
import { OrderService } from '../../../core/services/order.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Product, User, Order, Subscription, Price } from '../../../models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="dashboard-container">
      <h1><mat-icon>dashboard</mat-icon> Admin Dashboard</h1>
      <div class="stats-grid">
        <mat-card class="stat-card products"><mat-icon>inventory_2</mat-icon><div class="stat-info"><span class="stat-value">{{ totalProduct }}</span><span class="stat-label">Products</span></div><a mat-button color="primary" routerLink="/admin/products">Manage</a></mat-card>
        <mat-card class="stat-card users"><mat-icon>people</mat-icon><div class="stat-info"><span class="stat-value">{{ totalUsers }}</span><span class="stat-label">Users</span></div><a mat-button color="primary" routerLink="/admin/users">Manage</a></mat-card>
        <mat-card class="stat-card orders"><mat-icon>receipt_long</mat-icon><div class="stat-info"><span class="stat-value">{{ orders.length }}</span><span class="stat-label">Orders</span></div><a mat-button color="primary" routerLink="/admin/orders">View</a></mat-card>
        <mat-card class="stat-card revenue"><mat-icon>attach_money</mat-icon><div class="stat-info"><span class="stat-value">\${{ totalRevenue.toFixed(2) }}</span><span class="stat-label">Revenue</span></div></mat-card>
        <mat-card class="stat-card plans"><mat-icon>payments</mat-icon><div class="stat-info"><span class="stat-value">{{ totalPlans }}</span><span class="stat-label">Plans</span></div><a mat-button color="primary" routerLink="/admin/plans">Manage</a></mat-card>
        <mat-card class="stat-card subscriptions"><mat-icon>card_membership</mat-icon><div class="stat-info"><span class="stat-value">{{ totalSubscriptions }}</span><span class="stat-label">Subscriptions</span></div><a mat-button color="primary" routerLink="/admin/subscriptions">Manage</a></mat-card>
      </div>
      <div class="recent-section">
        <h2>Recent Orders</h2>
        <mat-card *ngIf="orders.length > 0">
          <table class="recent-table"><thead><tr><th>Order ID</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
          <tbody><tr *ngFor="let order of orders | slice:0:5;let i = index"><td>{{ i + 1 }}</td><td>{{ order.createdAt | date:'short' }}</td><td>\${{ order.totalAmount.toFixed(2) }}</td><td><span class="status-badge" [class]="'status-' + order.status">{{ order.status }}</span></td></tr></tbody></table>
        </mat-card>
        <mat-card *ngIf="orders.length === 0" class="empty-card"><p>No recent orders</p></mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .dashboard-container h1 { display: flex; align-items: center; gap: 8px; color: #333; margin-bottom: 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px !important; }
    .stat-card mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .stat-card.products mat-icon { color: #3f51b5; }
    .stat-card.users mat-icon { color: #4caf50; }
    .stat-card.orders mat-icon { color: #ff9800; }
    .stat-card.revenue mat-icon { color: #e91e63; }
    .stat-card.plans mat-icon { color: #009688; }
    .stat-card.subscriptions mat-icon { color: #673ab7; }
    .stat-info { flex: 1; }
    .stat-value { display: block; font-size: 1.8em; font-weight: bold; color: #333; }
    .stat-label { color: #666; font-size: 14px; }
    .recent-section h2 { color: #333; margin-bottom: 16px; }
    .recent-table { width: 100%; border-collapse: collapse; }
    .recent-table th, .recent-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    .recent-table th { color: #666; font-weight: 500; }
    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .status-pending { background: #fff3e0; color: #e65100; }
    .status-processing { background: #e3f2fd; color: #1565c0; }
    .status-shipped { background: #f3e5f5; color: #7b1fa2; }
    .status-delivered { background: #e8f5e9; color: #2e7d32; }
    .status-cancelled { background: #ffebee; color: #c62828; }
    .empty-card { text-align: center; padding: 32px !important; color: #999; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  orders: Order[] = []; totalRevenue = 0;
  totalProduct:number = 0;
  totalUsers:number = 0;
  totalPlans = 0;
  totalSubscriptions = 0;

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private orderService: OrderService,
    private subscriptionService: SubscriptionService
  ) {}
  ngOnInit(): void {
    this.productService.getProducts(1, 10).subscribe((res:any) => {this.totalProduct = res?.pagination?.total || 0});
    this.userService.getUsersCount().subscribe((users:any) => this.totalUsers = users?.count || 0);
    this.orderService.getAllOrders().subscribe({ next: (result) => { this.orders = result.orders || []; this.totalRevenue = (result.orders || []).reduce((sum: number, order: Order) => sum + order.totalAmount, 0); }, error: () => {} });
    this.subscriptionService.getAllPrices().subscribe((prices: Price[]) => this.totalPlans = prices.length);
    this.subscriptionService.getAllSubscriptions().subscribe((subs: Subscription[]) => this.totalSubscriptions = subs.length);
  }
}
