import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Subscription } from '../../../models';
import { TableSkeletonComponent } from '../../../shared/components/skeleton/table-skeleton.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-subscriptions',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, TableSkeletonComponent],
  template: `
    <div class="subscriptions-container">
      <div class="header">
        <h1><mat-icon>card_membership</mat-icon> My Subscriptions</h1>
        <a mat-raised-button color="primary" routerLink="/subscriptions/plans">
          <mat-icon>add</mat-icon> Browse Plans
        </a>
      </div>

      <mat-card class="table-card">
        <app-table-skeleton *ngIf="isLoading" [rows]="3" [columns]="displayedColumns.length"></app-table-skeleton>
        <table *ngIf="!isLoading" mat-table [dataSource]="subscriptions" class="full-width">
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
            <th mat-header-cell *matHeaderCellDef>Renews On</th>
            <td mat-cell *matCellDef="let s">{{ s.currentPeriodEnd | date:'mediumDate' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let s">
              <button
                *ngIf="s.status === 'active'"
                mat-stroked-button
                color="warn"
                (click)="cancelAtPeriodEnd(s)"
                [disabled]="cancellingId === s.id"
              >
                <mat-icon>cancel</mat-icon> Cancel at Period End
              </button>
              <button
                *ngIf="s.status === 'active'"
                mat-stroked-button
                color="warn"
                (click)="immediateCancel(s)"
                [disabled]="cancellingId === s.id"
                style="margin-left: 8px;"
              >
                <mat-icon>block</mat-icon> Cancel Now
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <p *ngIf="!isLoading && subscriptions.length === 0" class="empty-state">
          You have no active subscriptions.
          <a routerLink="/subscriptions/plans">Browse plans</a> to get started.
        </p>
      </mat-card>
    </div>
  `,
  styles: [`
    .subscriptions-container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .header h1 { display: flex; align-items: center; gap: 8px; color: #333; }
    .table-card { overflow-x: auto; }
    table { width: 100%; }
    .empty-state { text-align: center; padding: 32px; color: #888; }
    .empty-state a { color: #3f51b5; text-decoration: none; margin-left: 4px; }
    .status-active { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-canceled { background-color: #fbe9e7 !important; color: #c62828 !important; }
    .status-past_due { background-color: #fff3e0 !important; color: #e65100 !important; }
    .status-trialing { background-color: #e3f2fd !important; color: #1565c0 !important; }
    .status-incomplete { background-color: #f3e5f5 !important; color: #7b1fa2 !important; }
    .status-unpaid { background-color: #fce4ec !important; color: #b71c1c !important; }
  `]
})
export class MySubscriptionsComponent implements OnInit {
  subscriptions: Subscription[] = [];
  displayedColumns = ['plan', 'amount', 'status', 'period', 'actions'];
  isLoading = false;
  cancellingId: number | null = null;

  constructor(
    private subscriptionService: SubscriptionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.isLoading = true;
    this.subscriptionService.getMySubscriptions().subscribe({
      next: (subs) => { this.subscriptions = subs; this.isLoading = false; },
      error: () => this.isLoading = false,
    });
  }

  cancelAtPeriodEnd(sub: Subscription): void {
    Swal.fire({
      title: 'Cancel Subscription?',
      text: 'Your subscription will remain active until the end of the current billing period.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Cancel at Period End',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cancellingId = sub.id;
        this.subscriptionService.cancelSubscription(sub.id).subscribe({
          next: (updated) => {
            const idx = this.subscriptions.findIndex(s => s.id === sub.id);
            if (idx !== -1) this.subscriptions[idx] = updated;
            this.toastr.success('Subscription will cancel at period end');
            this.cancellingId = null;
          },
          error: (err) => { this.toastr.error(err.message); this.cancellingId = null; },
        });
      }
    });
  }

  immediateCancel(sub: Subscription): void {
    Swal.fire({
      title: 'Cancel Immediately?',
      text: 'Your subscription will be canceled right now and you will lose access.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Cancel Now',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cancellingId = sub.id;
        this.subscriptionService.immediateCancelSubscription(sub.id).subscribe({
          next: (updated) => {
            const idx = this.subscriptions.findIndex(s => s.id === sub.id);
            if (idx !== -1) this.subscriptions[idx] = updated;
            this.toastr.success('Subscription canceled immediately');
            this.cancellingId = null;
          },
          error: (err) => { this.toastr.error(err.message); this.cancellingId = null; },
        });
      }
    });
  }
}
