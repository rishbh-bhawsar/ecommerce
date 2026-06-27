import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { AuthService } from '../../../core/services/auth.service';
import { Price } from '../../../models';

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="plans-container">
      <h1><mat-icon>payments</mat-icon> Subscription Plans</h1>
      <p class="subtitle">Choose a plan that works for you</p>

      <div *ngIf="isLoading" class="loading-state">
        <mat-icon class="spin">refresh</mat-icon>
        <span>Loading plans...</span>
      </div>

      <div *ngIf="!isLoading && prices.length === 0" class="empty-state">
        <mat-icon>info</mat-icon>
        <p>No subscription plans available yet.</p>
      </div>

      <div class="plans-grid" *ngIf="!isLoading && prices.length > 0">
        <mat-card *ngFor="let price of prices" class="plan-card">
          <div class="plan-header">
            <h2>{{ price.nickname }}</h2>
            <p class="plan-name">{{ price.name }}</p>
            <div class="price">
              <span class="amount">{{ (price.amount / 100) | currency: (price.currency | uppercase) }}</span>
              <span class="period">/ {{ price.interval }}</span>
            </div>
          </div>
          <div class="plan-details">
            <mat-chip>{{ price.intervalCount }} {{ price.interval }}(s)</mat-chip>
          </div>
          <mat-card-actions>
            <button
              mat-raised-button
              color="primary"
              class="subscribe-btn"
              (click)="subscribe(price)"
              [disabled]="subscribingPriceId === price.id"
            >
              <mat-icon *ngIf="subscribingPriceId !== price.id">star</mat-icon>
              <mat-icon *ngIf="subscribingPriceId === price.id" class="spin">refresh</mat-icon>
              {{ subscribingPriceId === price.id ? 'Subscribing...' : 'Subscribe' }}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .plans-container { max-width: 1000px; margin: 0 auto; padding: 24px; }
    .plans-container h1 { display: flex; align-items: center; gap: 8px; color: #333; margin-bottom: 8px; }
    .subtitle { color: #666; margin-bottom: 32px; }
    .loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: #888; }
    .plans-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
    .plan-card { display: flex; flex-direction: column; text-align: center; }
    .plan-header { padding: 24px 24px 0; }
    .plan-header h2 { color: #333; margin-bottom: 4px; }
    .plan-name { color: #666; font-size: 0.9em; margin-bottom: 12px; }
    .price { margin-bottom: 16px; }
    .amount { font-size: 2em; font-weight: bold; color: #3f51b5; }
    .period { color: #888; font-size: 0.9em; }
    .plan-details { padding: 0 24px 16px; }
    mat-card-actions { padding: 0 24px 24px !important; }
    .subscribe-btn { width: 100%; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class SubscriptionPlansComponent implements OnInit {
  prices: Price[] = [];
  isLoading = false;
  subscribingPriceId: number | null = null;

  constructor(
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadPrices();
  }

  loadPrices(): void {
    this.isLoading = true;
    this.subscriptionService.getAllPrices().subscribe({
      next: (prices) => { this.prices = prices; this.isLoading = false; },
      error: () => this.isLoading = false,
    });
  }

  subscribe(price: Price): void {
    if (!this.authService.isAuthenticated()) {
      this.toastr.warning('Please login to subscribe');
      return;
    }

    this.subscribingPriceId = price.id;
    this.subscriptionService.createSubscription({ priceId: price.id }).subscribe({
      next: () => {
        this.toastr.success(`Successfully subscribed to ${price.nickname}!`);
        this.subscribingPriceId = null;
      },
      error: (err) => {
        this.toastr.error(err.message || 'Failed to subscribe');
        this.subscribingPriceId = null;
      },
    });
  }
}
