import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Price } from '../../../models';
import { TableSkeletonComponent } from '../../../shared/components/skeleton/table-skeleton.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage-plans',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    TableSkeletonComponent,
  ],
  template: `
    <div class="manage-container">
      <h1><mat-icon>payments</mat-icon> Manage Plans</h1>

      <mat-card class="form-card">
        <h2>{{ editId ? 'Edit Price' : 'Create New Price' }}</h2>
        <form [formGroup]="priceForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Stripe Price ID</mat-label>
              <input matInput formControlName="stripePriceId" placeholder="price_xxxxx">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Nickname</mat-label>
              <input matInput formControlName="nickname" placeholder="Basic Plan">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" placeholder="Price Name">
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Amount (cents)</mat-label>
              <input matInput type="number" formControlName="amount" placeholder="999">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Currency</mat-label>
              <mat-select formControlName="currency">
                <mat-option value="usd">USD</mat-option>
                <mat-option value="eur">EUR</mat-option>
                <mat-option value="gbp">GBP</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Interval</mat-label>
              <mat-select formControlName="interval">
                <mat-option value="month">Monthly</mat-option>
                <mat-option value="year">Yearly</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Interval Count</mat-label>
              <input matInput type="number" formControlName="intervalCount" placeholder="1">
            </mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="priceForm.invalid || isSaving">
              <mat-icon>{{ editId ? 'save' : 'add' }}</mat-icon>
              {{ editId ? 'Update' : 'Create' }}
            </button>
            <button *ngIf="editId" mat-stroked-button type="button" (click)="resetForm()">Cancel</button>
          </div>
        </form>
      </mat-card>

      <mat-card class="table-card">
        <app-table-skeleton *ngIf="isLoading" [rows]="5" [columns]="5"></app-table-skeleton>
        <table *ngIf="!isLoading" mat-table [dataSource]="prices" class="full-width">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let p">{{ p.id }}</td>
          </ng-container>
          <ng-container matColumnDef="nickname">
            <th mat-header-cell *matHeaderCellDef>Nickname</th>
            <td mat-cell *matCellDef="let p">{{ p.nickname }}</td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let p">{{ p.name }}</td>
          </ng-container>
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let p">{{ (p.amount / 100) | currency: (p.currency | uppercase) }}</td>
          </ng-container>
          <ng-container matColumnDef="interval">
            <th mat-header-cell *matHeaderCellDef>Interval</th>
            <td mat-cell *matCellDef="let p">
              <mat-chip>{{ p.intervalCount }} {{ p.interval }}(s)</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let p">
              <button mat-icon-button color="primary" (click)="editPrice(p)" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deletePrice(p)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card>
    </div>
  `,
  styles: [`
    .manage-container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .manage-container h1 { display: flex; align-items: center; gap: 8px; color: #333; margin-bottom: 24px; }
    .form-card { padding: 24px; margin-bottom: 24px; }
    .form-card h2 { margin-bottom: 16px; color: #555; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .form-row mat-form-field { flex: 1; min-width: 180px; }
    .form-actions { display: flex; gap: 8px; margin-top: 8px; }
    .table-card { overflow-x: auto; }
    table { width: 100%; }
  `]
})
export class ManagePlansComponent implements OnInit {
  prices: Price[] = [];
  displayedColumns = ['id', 'nickname', 'name', 'amount', 'interval', 'actions'];
  isLoading = false;
  isSaving = false;
  editId: number | null = null;
  priceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private subscriptionService: SubscriptionService,
    private toastr: ToastrService
  ) {
    this.priceForm = this.fb.group({
      stripePriceId: ['', Validators.required],
      nickname: ['', Validators.required],
      name: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      currency: ['usd', Validators.required],
      interval: ['month', Validators.required],
      intervalCount: [1, [Validators.required, Validators.min(1)]],
    });
  }

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

  onSubmit(): void {
    if (this.priceForm.invalid) return;
    this.isSaving = true;
    const data = this.priceForm.value;

    const request$ = this.editId
      ? this.subscriptionService.updatePrice(this.editId, data)
      : this.subscriptionService.createPrice(data);

    request$.subscribe({
      next: () => {
        this.toastr.success(this.editId ? 'Price updated' : 'Price created');
        this.resetForm();
        this.loadPrices();
        this.isSaving = false;
      },
      error: (err) => { this.toastr.error(err.message); this.isSaving = false; },
    });
  }

  editPrice(price: Price): void {
    this.editId = price.id;
    this.priceForm.patchValue({
      stripePriceId: price.stripePriceId,
      nickname: price.nickname,
      name: price.name,
      amount: price.amount,
      currency: price.currency,
      interval: price.interval,
      intervalCount: price.intervalCount,
    });
  }

  deletePrice(price: Price): void {
    Swal.fire({
      title: 'Delete Price?',
      text: `Are you sure you want to delete "${price.nickname}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Delete',
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptionService.deletePrice(price.id).subscribe({
          next: () => { this.toastr.success('Price deleted'); this.loadPrices(); },
          error: (err) => this.toastr.error(err.message),
        });
      }
    });
  }

  resetForm(): void {
    this.editId = null;
    this.priceForm.reset({ currency: 'usd', interval: 'month', intervalCount: 1 });
  }
}
