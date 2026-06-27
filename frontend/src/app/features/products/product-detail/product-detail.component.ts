import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatDividerModule, FormsModule],
  template: `
    <div class="detail-container" *ngIf="product">
      <div class="detail-grid">
        <div class="image-section">
          <img *ngIf="product.image" [src]="product.image" [alt]="product.name">
          <div *ngIf="!product.image" class="product-initials">{{ product.name | slice:0:2 }}</div>
        </div>
        <div class="info-section">
          <mat-chip color="primary">{{ getCategoryName(product.category) }}</mat-chip>
          <h1>{{ product.name }}</h1>
          <p class="description">{{ product.description }}</p>
          <mat-divider></mat-divider>
          <div class="price-section">
            <span class="price">\${{ product.price.toFixed(2) }}</span>
            <span class="stock" [class.low]="product.stock < 5">
              <mat-icon>{{ product.stock > 0 ? 'check_circle' : 'cancel' }}</mat-icon>
              {{ product.stock > 0 ? product.stock + ' in stock' : 'Out of stock' }}
            </span>
          </div>

          <div class="quantity-section" *ngIf="product.stock > 0">
            <label>Quantity:</label>
            <div class="quantity-controls">
              <button mat-icon-button (click)="decrementQty()" [disabled]="quantity <= 1">
                <mat-icon>remove</mat-icon>
              </button>
              <span class="qty-value">{{ quantity }}</span>
              <button mat-icon-button (click)="incrementQty()" [disabled]="quantity >= product.stock">
                <mat-icon>add</mat-icon>
              </button>
            </div>
          </div>

          <div class="actions">
            <button mat-raised-button color="primary" (click)="addToCart()" [disabled]="product.stock === 0" class="add-btn">
              <mat-icon>add_shopping_cart</mat-icon>
              {{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
            </button>
            <a mat-stroked-button routerLink="/products">
              <mat-icon>arrow_back</mat-icon>
              Back to Products
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-container { max-width: 1000px; margin: 0 auto; padding: 24px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
    .image-section img { width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .image-section { display: flex; align-items: center; justify-content: center; }
    .product-initials { width: 100%; height: 400px; background: #e8eaf6; color: #3f51b5; font-size: 80px; font-weight: bold; display: flex; align-items: center; justify-content: center; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .info-section { display: flex; flex-direction: column; gap: 16px; }
    .info-section h1 { margin: 8px 0; color: #333; }
    .description { color: #666; line-height: 1.6; }
    mat-divider { margin: 8px 0; }
    .price-section { display: flex; justify-content: space-between; align-items: center; }
    .price { font-size: 2em; font-weight: bold; color: #3f51b5; }
    .stock { display: flex; align-items: center; gap: 4px; font-size: 14px; color: #4caf50; }
    .stock.low { color: #ff5722; }
    .quantity-section { display: flex; align-items: center; gap: 16px; }
    .quantity-controls { display: flex; align-items: center; gap: 8px; border: 1px solid #ddd; border-radius: 8px; padding: 4px 8px; }
    .qty-value { font-size: 1.2em; font-weight: bold; min-width: 40px; text-align: center; }
    .actions { display: flex; gap: 12px; margin-top: 16px; }
    .add-btn { flex: 1; }
    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product!: Product;
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productService.getProductById(id).subscribe({
      next: (product) => this.product = product
    });
  }

  incrementQty(): void {
    if (this.quantity < this.product.stock) this.quantity++;
  }

  decrementQty(): void {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart(): void {
    this.cartService.addToCart(this.product.id, this.quantity).subscribe();
  }

  getCategoryName(category: Product['category']): string {
    if (!category) return '';
    return typeof category === 'string' ? category : category.name;
  }
}
