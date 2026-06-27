import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService, Category } from '../../../core/services/category.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Add New Product</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Product Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter product name">
              <mat-error *ngIf="productForm.get('name')?.hasError('required')">Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="4" placeholder="Enter product description"></textarea>
              <mat-error *ngIf="productForm.get('description')?.hasError('required')">Description is required</mat-error>
            </mat-form-field>

            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Price</mat-label>
                <input matInput type="number" formControlName="price" placeholder="0.00">
                <span matPrefix>$</span>
                <mat-error *ngIf="productForm.get('price')?.hasError('required')">Price is required</mat-error>
                <mat-error *ngIf="productForm.get('price')?.hasError('min')">Price must be positive</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Stock</mat-label>
                <input matInput type="number" formControlName="stock" placeholder="0">
                <mat-error *ngIf="productForm.get('stock')?.hasError('required')">Stock is required</mat-error>
                <mat-error *ngIf="productForm.get('stock')?.hasError('min')">Stock cannot be negative</mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Category</mat-label>
              <mat-select formControlName="categoryId">
                <mat-option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</mat-option>
              </mat-select>
              <mat-error *ngIf="productForm.get('categoryId')?.hasError('required')">Category is required</mat-error>
            </mat-form-field>

            <div class="file-section">
              <label class="file-label">Product Image</label>
              <input type="file" (change)="onFileSelected($event)" accept="image/*" #fileInput>
              <div class="image-preview" *ngIf="imagePreview">
                <img [src]="imagePreview" alt="Preview">
                <button mat-icon-button type="button" (click)="removeImage()">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>

            <div class="actions">
              <button mat-button type="button" (click)="onCancel()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="productForm.invalid || isSubmitting">
                <mat-icon>save</mat-icon>
                {{ isSubmitting ? 'Creating...' : 'Create Product' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container { max-width: 700px; margin: 24px auto; padding: 0 24px; }
    .full-width { width: 100%; }
    .row { display: flex; gap: 16px; }
    .row mat-form-field { flex: 1; }
    .file-section { margin: 16px 0; }
    .file-label { display: block; margin-bottom: 8px; font-weight: 500; color: #666; }
    input[type="file"] { margin-bottom: 12px; }
    .image-preview { position: relative; display: inline-block; margin-top: 8px; }
    .image-preview img { max-width: 200px; max-height: 150px; border-radius: 8px; border: 1px solid #ddd; }
    .image-preview button { position: absolute; top: -8px; right: -8px; background: white; }
    .actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
  `]
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isSubmitting = false;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/products']);
      return;
    }

    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required]
    });

    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(cats => this.categories = cats || []);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('name', this.productForm.value.name);
    formData.append('description', this.productForm.value.description);
    formData.append('price', this.productForm.value.price.toString());
    formData.append('stock', this.productForm.value.stock.toString());
    formData.append('categoryId', this.productForm.value.categoryId);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.productService.createProduct(formData).subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }
}
