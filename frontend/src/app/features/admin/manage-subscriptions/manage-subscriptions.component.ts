import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Subscription } from '../../../models';
import { TableSkeletonComponent } from '../../../shared/components/skeleton/table-skeleton.component';

@Component({
  selector: 'app-manage-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    TableSkeletonComponent,
  ],
  template: `
    <div class="manage-container">
      <h1><mat-icon>card_membership</mat-icon> Manage Subscriptions</h1>

      <mat-card class="table-card">
        <mat-tab-group>
          <mat-tab label="Active Subscriptions">
            <app-table-skeleton *ngIf="isLoading" [rows]="5" [columns]="displayedColumns.length"></app-table-skeleton>
            <table *ngIf="!isLoading" mat-table [dataSource]="subscriptions" class="full-width">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let s">{{ s.id }}</td>
              </ng-container>
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let s">{{ s.user?.name || 'N/A' }}</td>
              </ng-container>
              <ng-container matColumnDef="plan">
                <th mat-header-cell *matHeaderCellDef>Plan</th>
                <td mat-cell *matCellDef="let s">{{ s.price?.nickname || 'N/A' }}</td>
              </ng-container>
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let s">{{ (s.price?.amount! / 100) | currency: (s.price?.currency | uppercase) }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let s">
                  <mat-chip [class]="'status-' + s.status">{{ s.status }}</mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="period">
                <th mat-header-cell *matHeaderCellDef>Current Period</th>
                <td mat-cell *matCellDef="let s">{{ s.currentPeriodEnd | date:'mediumDate' }}</td>
              </ng-container>
              <ng-container matColumnDef="created">
                <th mat-header-cell *matHeaderCellDef>Created</th>
                <td mat-cell *matCellDef="let s">{{ s.createdAt | date:'short' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
            <p *ngIf="!isLoading && subscriptions.length === 0" class="empty-state">No active subscriptions found.</p>
          </mat-tab>

          <mat-tab label="Subscription History">
            <app-table-skeleton *ngIf="isHistoryLoading" [rows]="5" [columns]="historyColumns.length"></app-table-skeleton>
            <table *ngIf="!isHistoryLoading" mat-table [dataSource]="history" class="full-width">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let s">{{ s.id }}</td>
              </ng-container>
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let s">{{ s.user?.name || 'N/A' }}</td>
              </ng-container>
              <ng-container matColumnDef="plan">
                <th mat-header-cell *matHeaderCellDef>Plan</th>
                <td mat-cell *matCellDef="let s">{{ s.price?.nickname || 'N/A' }}</td>
              </ng-container>
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let s">{{ (s.price?.amount! / 100) | currency: (s.price?.currency | uppercase) }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let s">
                  <mat-chip [class]="'status-' + s.status">{{ s.status }}</mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="canceledAt">
                <th mat-header-cell *matHeaderCellDef>Canceled At</th>
                <td mat-cell *matCellDef="let s">{{ s.canceledAt ? (s.canceledAt | date:'short') : 'N/A' }}</td>
              </ng-container>
              <ng-container matColumnDef="created">
                <th mat-header-cell *matHeaderCellDef>Created</th>
                <td mat-cell *matCellDef="let s">{{ s.createdAt | date:'short' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="historyColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: historyColumns;"></tr>
            </table>
            <p *ngIf="!isHistoryLoading && history.length === 0" class="empty-state">No subscription history found.</p>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .manage-container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .manage-container h1 { display: flex; align-items: center; gap: 8px; color: #333; margin-bottom: 24px; }
    .table-card { overflow-x: auto; }
    table { width: 100%; padding: 16px; }
    .empty-state { text-align: center; padding: 32px; color: #888; }
    .status-active { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-canceled { background-color: #fbe9e7 !important; color: #c62828 !important; }
    .status-past_due { background-color: #fff3e0 !important; color: #e65100 !important; }
    .status-trialing { background-color: #e3f2fd !important; color: #1565c0 !important; }
    .status-incomplete { background-color: #f3e5f5 !important; color: #7b1fa2 !important; }
    .status-unpaid { background-color: #fce4ec !important; color: #b71c1c !important; }
  `]
})
export class ManageSubscriptionsComponent implements OnInit {
  subscriptions: Subscription[] = [];
  history: Subscription[] = [];
  displayedColumns = ['id', 'user', 'plan', 'amount', 'status', 'period', 'created'];
  historyColumns = ['id', 'user', 'plan', 'amount', 'status', 'canceledAt', 'created'];
  isLoading = false;
  isHistoryLoading = false;

  constructor(
    private subscriptionService: SubscriptionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadSubscriptions();
    this.loadHistory();
  }

  loadSubscriptions(): void {
    this.isLoading = true;
    this.subscriptionService.getAllSubscriptions().subscribe({
      next: (subs) => { this.subscriptions = subs; this.isLoading = false; },
      error: () => this.isLoading = false,
    });
  }

  loadHistory(): void {
    this.isHistoryLoading = true;
    this.subscriptionService.getSubscriptionHistory().subscribe({
      next: (history) => { this.history = history; this.isHistoryLoading = false; },
      error: () => this.isHistoryLoading = false,
    });
  }
}
