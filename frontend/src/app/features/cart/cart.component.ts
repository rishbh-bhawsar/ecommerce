import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from '../../core/services/cart.service';
import { Cart, CartItem } from '../../models';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, SkeletonComponent],
  template: `
    <div class="cart-container">
      <h1><mat-icon>shopping_cart</mat-icon> Shopping Cart</h1>
      <app-skeleton *ngIf="isLoading" [count]="3"></app-skeleton>
      <div class="cart-content" *ngIf="!isLoading && cart && cart.items && cart.items.length > 0">
        <div class="cart-items">
          <mat-card *ngFor="let item of cart.items" class="cart-item">
            <div class="item-image">
              <img *ngIf="item.product.image" [src]="item.product.image" [alt]="item.product.name">
              <div *ngIf="!item.product.image" class="item-initials">{{ item.product.name | slice:0:2 }}</div>
            </div>
            <div class="item-details">
              <h3><a [routerLink]="['/products', item.product.id]">{{ item.product.name }}</a></h3>
              <p class="item-price">\${{ item.product.price ? item.product.price.toFixed(2) : "0" }} each</p>
              <div class="quantity-controls">
                <button mat-icon-button (click)="updateQuantity(item, item.quantity - 1)" [disabled]="item.quantity <= 1"><mat-icon>remove</mat-icon></button>
                <span>{{ item.quantity }}</span>
                <button mat-icon-button (click)="updateQuantity(item, item.quantity + 1)"><mat-icon>add</mat-icon></button>
              </div>
            </div>
            <div class="item-actions">
              <span class="item-total">\${{ ((item.product.price || 0) * item.quantity).toFixed(2) }}</span>
              <button mat-icon-button color="warn" (click)="removeItem(item.product.id)"><mat-icon>delete</mat-icon></button>
            </div>
          </mat-card>
        </div>
        <mat-card class="cart-summary">
          <h2>Order Summary</h2>
          <mat-divider></mat-divider>
          <div class="summary-row"><span>Subtotal ({{ totalItems }} items)</span><span>\${{ cart.total ? cart.total.toFixed(2) : "0" }}</span></div>
          <div class="summary-row"><span>Shipping</span><span class="free-shipping">Free</span></div>
          <mat-divider></mat-divider>
          <div class="summary-row total"><span>Total</span><span>\${{ cart.total ? cart.total.toFixed(2) : "0" }}</span></div>
          <button mat-raised-button color="primary" class="checkout-btn" (click)="checkoutSession(cart)"><mat-icon>payment</mat-icon> Proceed to Checkout</button>
          <a mat-button routerLink="/products" class="continue-btn"><mat-icon>arrow_back</mat-icon> Continue Shopping</a>
        </mat-card>
      </div>
      <div class="empty-cart" *ngIf="!isLoading && (!cart || !cart.items || cart.items.length === 0)">
        <mat-icon class="empty-icon">shopping_cart</mat-icon>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <a mat-raised-button color="primary" routerLink="/products"><mat-icon>shopping_bag</mat-icon> Browse Products</a>
      </div>
    </div>
  `,
  styles: [`
    .cart-container { max-width: 1000px; margin: 0 auto; padding: 24px; }
    .cart-container h1 { display: flex; align-items: center; gap: 8px; color: #333; margin-bottom: 24px; }
    .cart-content { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; align-items: start; }
    .cart-items { display: flex; flex-direction: column; gap: 16px; }
    .cart-item { display: flex; align-items: center; gap: 16px; padding: 16px !important; }
    .item-image img { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; }
    .item-initials { width: 100px; height: 100px; background: #e8eaf6; color: #3f51b5; font-weight: bold; font-size: 28px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
    .item-details { flex: 1; }
    .item-details h3 { margin: 0 0 4px; }
    .item-details h3 a { text-decoration: none; color: #333; }
    .item-details h3 a:hover { color: #3f51b5; }
    .item-price { color: #666; margin: 4px 0; }
    .quantity-controls { display: flex; align-items: center; gap: 8px; border: 1px solid #ddd; border-radius: 20px; width: fit-content; padding: 0 4px; }
    .quantity-controls span { min-width: 30px; text-align: center; font-weight: bold; }
    .item-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .item-total { font-size: 1.2em; font-weight: bold; color: #3f51b5; }
    .cart-summary { padding: 24px !important; position: sticky; top: 80px; }
    .cart-summary h2 { margin: 0 0 16px; }
    .summary-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 16px; }
    .summary-row.total { font-size: 1.3em; font-weight: bold; color: #3f51b5; }
    .free-shipping { color: #4caf50; font-weight: bold; }
    .checkout-btn { width: 100%; margin-top: 16px !important; padding: 12px !important; font-size: 16px !important; }
    .continue-btn { width: 100%; margin-top: 8px !important; }
    .empty-cart { text-align: center; padding: 60px 20px; }
    .empty-icon { font-size: 80px; width: 80px; height: 80px; color: #ccc; }
    @media (max-width: 768px) { .cart-content { grid-template-columns: 1fr; } .cart-item { flex-wrap: wrap; } }
  `]
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  totalItems = 0;
  isLoading = false;
  constructor(private cartService: CartService, private orderService :OrderService) {}
  ngOnInit(): void {
    this.isLoading = true;
    this.cartService.cart$.subscribe(cart => { this.cart = cart; this.totalItems = cart?.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0; });
    this.cartService.getCart().subscribe({ next: () => this.isLoading = false, error: () => this.isLoading = false });
  }
  updateQuantity(item: CartItem, quantity: number): void {
    if (!item.product?.id) return;
    if (quantity <= 0) this.removeItem(item.product.id);
    else this.cartService.updateCartItem(item.product.id, quantity).subscribe();
  }
  removeItem(productId: number | undefined): void {
    if (productId == null) return;
    this.cartService.removeFromCart(productId).subscribe();
  }


  checkoutSession(data:any){
    let body:any ={
  items: [
    {
      productId: data?.items[0]?.productId,
      quantity: data?.items[0]?.quantity,
    }
  ]
    }
    this.orderService.createCheckoutSession(body).subscribe((res:any)=>{
      console.log('res',res);
      
      if(res?.data?.checkoutUrl){
        window.location.href = res.data.checkoutUrl;
        // window.open(res?.data?.checkoutUrl)
      }  
    })
  }
}
