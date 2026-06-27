import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule, MatMenuModule],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <a routerLink="/products" class="brand">
        <mat-icon>store</mat-icon>
        <span>E-Shop</span>
      </a>
      <span class="spacer"></span>
      <div class="nav-links">
        <a mat-button routerLink="/products" routerLinkActive="active-link">
          <mat-icon>shopping_bag</mat-icon>
          <span>Products</span>
        </a>
        <ng-container *ngIf="authService.isAuthenticated()">
          <a mat-button routerLink="/cart" routerLinkActive="active-link">
            <mat-icon [matBadge]="cartCount" [matBadgeHidden]="cartCount === 0" matBadgeColor="accent">shopping_cart</mat-icon>
            <span>Cart</span>
          </a>
          <a mat-button routerLink="/orders" routerLinkActive="active-link">
            <mat-icon>receipt_long</mat-icon>
            <span>Orders</span>
          </a>
          <!-- <a mat-button routerLink="/subscriptions/my" routerLinkActive="active-link">
            <mat-icon>card_membership</mat-icon>
            <span>Subscriptions</span>
          </a> -->
          <a mat-button *ngIf="authService.isAdmin()" routerLink="/admin" routerLinkActive="active-link">
            <mat-icon>admin_panel_settings</mat-icon>
            <span>Admin</span>
          </a>
          <button mat-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
            <span>{{ (authService.currentUser$ | async)?.name || 'User' }}</span>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </ng-container>
        <ng-container *ngIf="!authService.isAuthenticated()">
          <a mat-button routerLink="/login" routerLinkActive="active-link">
            <mat-icon>login</mat-icon>
            <span>Login</span>
          </a>
          <a mat-raised-button color="accent" routerLink="/register">Register</a>
        </ng-container>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar { position: sticky; top: 0; z-index: 1000; }
    .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; color: white; font-size: 1.3em; font-weight: bold; }
    .spacer { flex: 1; }
    .nav-links { display: flex; align-items: center; gap: 4px; }
    .active-link { background: rgba(255,255,255,0.1); border-radius: 4px; }
    @media (max-width: 768px) {
      .nav-links { gap: 0; }
      .nav-links a span, .nav-links button span { display: none; }
    }
  `]
})
export class NavbarComponent {
  cartCount = 0;
  constructor(public authService: AuthService, private cartService: CartService,private router: Router) {
    this.cartService.cart$.subscribe(cart => {
      this.cartCount = cart?.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    });
  }
  logout(): void {
    this.authService.logout();
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }
}
