import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../models';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService } from '../../../core/services/category.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatPaginatorModule, SkeletonComponent],
  template: `
    <div class="products-container">
      <div class="products-header">
        <h1>Our Products</h1>
        <div class="header-actions">
          <a mat-raised-button color="primary" routerLink="/products/create" *ngIf="authService.isAdmin()">
            <mat-icon>add</mat-icon> Add Product
          </a>
        </div>
        <div class="category-filter">
          <mat-chip-listbox (change)="onCategoryChange($event)">
            <mat-chip-option [selected]="!selectedCategory" (click)="filterByCategory(null)">All</mat-chip-option>
            <mat-chip-option *ngFor="let cat of categories" [value]="cat?.id" [selected]="selectedCategory === cat" (click)="filterByCategory(cat)">
              {{ cat?.name }}
            </mat-chip-option>
          </mat-chip-listbox>
        </div>
      </div>

      <app-skeleton *ngIf="isLoading" [count]="pageSize"></app-skeleton>

      <div class="products-grid" *ngIf="!isLoading && products.length > 0">
        <mat-card *ngFor="let product of products" class="product-card">
          <div class="product-image">
            <img *ngIf="product.image" [src]="product.image" [alt]="product.name">
            <div *ngIf="!product.image" class="product-initials">{{ product.name | slice:0:2 }}</div>
            <span class="stock-badge" *ngIf="product.stock < 5">Low Stock</span>
          </div>
          <mat-card-header>
            <mat-card-title>
              <a [routerLink]="['/products', product.id]">{{ product.name }}</a>
            </mat-card-title>
            <mat-card-subtitle>{{ getCategoryName(product.category) }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="description">{{ product.description | slice:0:100 }}{{ product.description.length > 100 ? '...' : '' }}</p>
            <div class="price-row">
              <span class="price">\${{ product.price.toFixed(2) }}</span>
              <span class="stock" [class.low]="product.stock < 5">{{ product.stock }} in stock</span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <a mat-button color="primary" [routerLink]="['/products', product.id]">
              <mat-icon>visibility</mat-icon>
              Details
            </a>
            <button mat-raised-button color="accent" (click)="addToCart(product)" [disabled]="product.stock === 0">
              <mat-icon>add_shopping_cart</mat-icon>
              {{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="no-products" *ngIf="products.length === 0 && !isLoading">
        <mat-icon class="no-icon">inventory_2</mat-icon>
        <h3>No products found</h3>
        <p>Try a different category or check back later.</p>
      </div>

      <mat-paginator
        [length]="totalProducts"
        [pageSize]="pageSize"
        [pageSizeOptions]="[6, 12, 24]"
        (page)="onPageChange($event)"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .products-container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .products-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .products-header h1 { margin: 0; color: #333; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; margin-bottom: 24px; }
    .product-card { transition: transform 0.2s, box-shadow 0.2s; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
    .product-image { position: relative; height: 200px; overflow: hidden; background: #f5f5f5; display: flex; align-items: center; justify-content: center; }
    .product-image img { width: 100%; height: 100%; object-fit: cover; }
    .product-initials { font-size: 48px; font-weight: bold; color: #3f51b5; background: #e8eaf6; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    .stock-badge { position: absolute; top: 8px; right: 8px; background: #ff5722; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .description { color: #666; font-size: 14px; margin: 8px 0; }
    .price-row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
    .price { font-size: 1.4em; font-weight: bold; color: #3f51b5; }
    .stock { font-size: 12px; color: #888; }
    .stock.low { color: #ff5722; }
    mat-card-title a { text-decoration: none; color: inherit; }
    mat-card-title a:hover { color: #3f51b5; }
    mat-card-actions { display: flex; justify-content: space-between; padding: 8px 16px 16px !important; }
    .no-products { text-align: center; padding: 60px 20px; color: #999; }
    .no-icon { font-size: 64px; width: 64px; height: 64px; }
    @media (max-width: 768px) {
      .products-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  totalProducts = 0;
  pageSize = 12;
  currentPage = 0;
  isLoading = false;
  selectedCategory: string | null = null;
  categories:any = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public authService: AuthService,
    private toastr: ToastrService,
    private categoryService : CategoryService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategorys();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts(this.currentPage + 1, this.pageSize, this.selectedCategory || undefined).subscribe({
      next: (res: any) => {
        this.products = res.products || [];
        this.totalProducts = res.pagination?.total || 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadCategorys(){
    this.categoryService.getCategories().subscribe((res:any)=>{
      this.categories = res;
    })
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  onCategoryChange(event: any): void {
    this.selectedCategory = event.value;
    this.currentPage = 0;
    this.loadProducts();
  }

  filterByCategory(category: any): void {    
    this.selectedCategory = category?.id;
    this.currentPage = 0;
    this.loadProducts();
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product.id).subscribe({
      next: () => this.toastr.success(`${product.name} added to cart`),
      error: (err) => this.toastr.error(err.message || 'Failed to add to cart')
    });
  }

  getCategoryName(category: Product['category']): string {
    if (!category) return '';
    return typeof category === 'string' ? category : category.name;
  }
}
