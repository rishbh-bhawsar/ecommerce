import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { Cart } from '../../models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatRadioModule, MatDividerModule],
  template: `
    <div class="checkout-container">
      <h1><mat-icon>payment</mat-icon> Checkout</h1>
      <div class="checkout-grid" *ngIf="cart && cart.items.length > 0">
        <mat-card class="shipping-card">
          <h2>Shipping Address</h2>
          <form [formGroup]="checkoutForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Address</mat-label>
              <textarea matInput formControlName="address" rows="2"></textarea>
            </mat-form-field>
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>City</mat-label><input matInput formControlName="city"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>State</mat-label><input matInput formControlName="state"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Zip Code</mat-label><input matInput formControlName="zipCode"></mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone" type="tel">
            </mat-form-field>
            <h2>Payment Method</h2>
            <mat-radio-group formControlName="paymentMethod" class="payment-options">
              <mat-radio-button value="credit_card"><mat-icon>credit_card</mat-icon> Credit Card</mat-radio-button>
              <mat-radio-button value="debit_card"><mat-icon>account_balance_wallet</mat-icon> Debit Card</mat-radio-button>
              <mat-radio-button value="cod"><mat-icon>payments</mat-icon> Cash on Delivery</mat-radio-button>
            </mat-radio-group>
          </form>
        </mat-card>
        <mat-card class="summary-card">
          <h2>Order Summary</h2>
          <div class="order-items">
            <div class="order-item" *ngFor="let item of cart.items">
              <span class="item-name">{{ item.product.name }} x {{ item.quantity }}</span>
              <span class="item-price">\${{ (item.product.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
          <mat-divider></mat-divider>
          <div class="summary-row"><span>Subtotal</span><span>\${{ cart.total.toFixed(2) }}</span></div>
          <div class="summary-row"><span>Shipping</span><span class="free">Free</span></div>
          <mat-divider></mat-divider>
          <div class="summary-row total"><span>Total</span><span>\${{ cart.total.toFixed(2) }}</span></div>
          <div class="error-message" *ngIf="errorMessage"><mat-icon>error</mat-icon> {{ errorMessage }}</div>
          <button mat-raised-button color="primary" class="place-order-btn" (click)="placeOrder()" [disabled]="checkoutForm.invalid || isProcessing">
            {{ isProcessing ? 'Processing...' : 'Place Order' }}
          </button>
          <a mat-button routerLink="/cart" class="back-btn"><mat-icon>arrow_back</mat-icon> Back to Cart</a>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container { max-width: 1000px; margin: 0 auto; padding: 24px; }
    .checkout-container h1 { display: flex; align-items: center; gap: 8px; color: #333; margin-bottom: 24px; }
    .checkout-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; align-items: start; }
    .shipping-card { padding: 24px !important; }
    .shipping-card h2 { margin: 0 0 16px; color: #333; }
    .full-width { width: 100%; }
    .row { display: flex; gap: 16px; }
    .row mat-form-field { flex: 1; }
    .payment-options { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
    .summary-card { padding: 24px !important; position: sticky; top: 80px; }
    .summary-card h2 { margin: 0 0 16px; }
    .order-items { margin-bottom: 16px; }
    .order-item { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .item-name { color: #666; }
    .item-price { font-weight: 500; }
    .summary-row { display: flex; justify-content: space-between; padding: 12px 0; }
    .summary-row.total { font-size: 1.3em; font-weight: bold; color: #3f51b5; }
    .free { color: #4caf50; font-weight: bold; }
    .place-order-btn { width: 100%; margin-top: 16px !important; padding: 12px !important; font-size: 16px !important; }
    .back-btn { width: 100%; margin-top: 8px !important; }
    .error-message { color: #f44336; display: flex; align-items: center; gap: 4px; margin-top: 8px; }
    @media (max-width: 768px) { .checkout-grid { grid-template-columns: 1fr; } .row { flex-direction: column; gap: 0; } }
  `]
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  cart: Cart | null = null;
  isProcessing = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private cartService: CartService, private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      fullName: ['', Validators.required], address: ['', Validators.required],
      city: ['', Validators.required], state: ['', Validators.required],
      zipCode: ['', Validators.required], phone: ['', Validators.required],
      paymentMethod: ['credit_card', Validators.required]
    });
    this.cartService.cart$.subscribe(cart => this.cart = cart);
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid || !this.cart?.items?.length) return;
    this.isProcessing = true;
    this.errorMessage = '';
    const items = this.cart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    this.orderService.createOrder({
      shippingAddress: this.checkoutForm.value,
      paymentMethod: this.checkoutForm.value.paymentMethod,
      items
    }).subscribe({
      next: () => { this.cartService.clearCart(); this.router.navigate(['/orders']); },
      error: (err) => { this.errorMessage = err.message || 'Failed to place order'; this.isProcessing = false; }
    });
  }
}
