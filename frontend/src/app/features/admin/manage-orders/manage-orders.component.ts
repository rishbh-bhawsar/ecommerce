import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../models';
import { TableSkeletonComponent } from '../../../shared/components/skeleton/table-skeleton.component';

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    TableSkeletonComponent,
  ],
  template: `
    <div class="manage-container">
      <h1><mat-icon>receipt_long</mat-icon> Manage Orders</h1>

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Filter by Status</mat-label>
          <mat-select (selectionChange)="onStatusFilter($event.value)" [value]="statusFilter">
            <mat-option value="">All</mat-option>
            <mat-option value="Pending">Pending</mat-option>
            <mat-option value="Processing">Processing</mat-option>
            <mat-option value="Shipped">Shipped</mat-option>
            <mat-option value="Delivered">Delivered</mat-option>
            <mat-option value="Cancelled">Cancelled</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <mat-card class="table-card">
        <app-table-skeleton *ngIf="isLoading" [rows]="5" [columns]="displayedColumns.length"></app-table-skeleton>
        <table *ngIf="!isLoading" mat-table [dataSource]="orders" class="full-width">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>Order ID</th>
            <td mat-cell *matCellDef="let o">{{ o.id }}</td>
          </ng-container>
          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef>User</th>
            <td mat-cell *matCellDef="let o">
              <div class="user-info">
                <span class="user-name">{{ o.user?.name || 'N/A' }}</span>
                <span class="user-email">{{ o.user?.email || '' }}</span>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="items">
            <th mat-header-cell *matHeaderCellDef>Items</th>
            <td mat-cell *matCellDef="let o">
              <span class="items-preview" *ngIf="o.items?.length">{{ o.items.length }} item(s)</span>
              <span *ngIf="!o.items?.length">-</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef>Total</th>
            <td mat-cell *matCellDef="let o">
              <span class="total-amount">\${{ o.totalAmount?.toFixed(2) }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let o">
              <select [value]="o.status" (change)="updateStatus(o, $any($event.target).value)" class="status-select" [class]="'status-' + o.status.toLowerCase()">
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </td>
          </ng-container>
          <ng-container matColumnDef="payment">
            <th mat-header-cell *matHeaderCellDef>Payment</th>
            <td mat-cell *matCellDef="let o">
              <mat-chip [class]="'payment-' + o.paymentStatus?.toLowerCase()">{{ o.paymentStatus }}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let o">{{ o.createdAt | date:'short' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <p *ngIf="!isLoading && orders.length === 0" class="empty-state">No orders found.</p>
      </mat-card>

      <mat-paginator
        *ngIf="totalCount > 0"
        [length]="totalCount"
        [pageSize]="pageSize"
        [pageSizeOptions]="[5, 10, 25, 50]"
        (page)="onPageChange($event)"
        showFirstLastButtons
      ></mat-paginator>
    </div>
  `,
  styles: [`
    .manage-container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .manage-container h1 { display: flex; align-items: center; gap: 8px; color: #333; margin-bottom: 24px; }
    .filters { margin-bottom: 16px; }
    .filters mat-form-field { width: 200px; }
    .table-card { overflow-x: auto; }
    table { width: 100%; }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-weight: 500; }
    .user-email { font-size: 12px; color: #888; }
    .items-preview { color: #666; font-size: 13px; }
    .total-amount { font-weight: bold; color: #333; }
    .status-select { padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; cursor: pointer; }
    .status-select.status-pending { border-color: #ff9800; }
    .status-select.status-processing { border-color: #2196f3; }
    .status-select.status-shipped { border-color: #9c27b0; }
    .status-select.status-delivered { border-color: #4caf50; }
    .status-select.status-cancelled { border-color: #f44336; }
    .payment-pending { background: #fff3e0 !important; color: #e65100 !important; }
    .payment-paid { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .payment-refunded { background: #fff3e0 !important; color: #e65100 !important; }
    .payment-failed { background: #ffebee !important; color: #c62828 !important; }
    .empty-state { text-align: center; padding: 32px; color: #888; }
  `]
})
export class ManageOrdersComponent implements OnInit {
  orders: Order[] = [];
  displayedColumns = ['id', 'user', 'items', 'total', 'status', 'payment', 'date'];
  isLoading = false;
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;
  statusFilter = '';

  constructor(
    private orderService: OrderService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders(this.currentPage, this.pageSize, this.statusFilter || undefined).subscribe({
      next: (result) => {
        this.orders = result.orders;
        this.totalCount = result.total;
        this.isLoading = false;
      },
      error: () => this.isLoading = false,
    });
  }

  onStatusFilter(status: string): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.loadOrders();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  updateStatus(order: Order, status: string): void {
    this.orderService.updateOrderStatus(order.id, status).subscribe({
      next: () => {
        order.status = status as any;
        this.toastr.success('Order status updated');
      },
      error: () => this.toastr.error('Failed to update status'),
    });
  }
}
