import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { Product } from '../../../models';
import  Swal  from 'sweetalert2';
import { TableSkeletonComponent } from '../../../shared/components/skeleton/table-skeleton.component';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatPaginatorModule, TableSkeletonComponent],
  template: `
    <div class="manage-container">
      <div class="header">
        <h1><mat-icon>inventory_2</mat-icon> Manage Products</h1>
        <button mat-raised-button color="primary" (click)="openForm()"><mat-icon>add</mat-icon> Add Product</button>
      </div>
      <mat-card class="form-card" *ngIf="showForm">
        <h2>{{ editingProduct ? 'Edit' : 'Add' }} Product</h2>
        <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
          <div class="form-grid">
            <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput formControlName="name"></mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="categoryId">
                <mat-option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Price</mat-label><input matInput formControlName="price" type="number"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Stock</mat-label><input matInput formControlName="stock" type="number"></mat-form-field>
          </div>
          <div class="file-section">
            <label class="file-label">Product Image</label>
            <input type="file" (change)="onFileSelected($event)" accept="image/*" #fileInput>
            <div class="image-preview" *ngIf="imagePreview">
              <img [src]="imagePreview" alt="Preview">
              <button mat-icon-button type="button" (click)="removeImage()"><mat-icon>close</mat-icon></button>
            </div>
          </div>
          <mat-form-field appearance="outline" class="full-width"><mat-label>Description</mat-label><textarea matInput formControlName="description" rows="3"></textarea></mat-form-field>
          <div class="form-actions">
            <button mat-button type="button" (click)="cancelForm()">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="productForm.invalid">{{ editingProduct ? 'Update' : 'Create' }}</button>
          </div>
        </form>
      </mat-card>
      <mat-card class="table-card">
        <app-table-skeleton *ngIf="isLoading" [rows]="pageSize" [columns]="displayedColumns.length"></app-table-skeleton>
        <table *ngIf="!isLoading" mat-table [dataSource]="products" class="full-width">
          <ng-container matColumnDef="image"><th mat-header-cell *matHeaderCellDef>Image</th><td mat-cell *matCellDef="let p">
            <img *ngIf="p.image" [src]="p.image" class="table-img">
            <div *ngIf="!p.image" class="table-initials">{{ p.name | slice:0:2 }}</div>
          </td></ng-container>
          <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Name</th><td mat-cell *matCellDef="let p">{{ p.name }}</td></ng-container>
          <ng-container matColumnDef="category"><th mat-header-cell *matHeaderCellDef>Category</th><td mat-cell *matCellDef="let p">{{ getCategoryName(p.category) }}</td></ng-container>
          <ng-container matColumnDef="price"><th mat-header-cell *matHeaderCellDef>Price</th><td mat-cell *matCellDef="let p">\${{ p.price.toFixed(2) }}</td></ng-container>
          <ng-container matColumnDef="stock"><th mat-header-cell *matHeaderCellDef>Stock</th><td mat-cell *matCellDef="let p">{{ p.stock }}</td></ng-container>
          <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>Actions</th><td mat-cell *matCellDef="let p">
            <button mat-icon-button color="primary" (click)="editProduct(p)"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="deleteProduct(p)"><mat-icon>delete</mat-icon></button>
          </td></ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator
          [length]="totalProducts"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .manage-container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { display: flex; align-items: center; gap: 8px; color: #333; }
    .form-card { padding: 24px !important; margin-bottom: 24px; }
    .form-card h2 { margin: 0 0 16px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; }
    .full-width { width: 100%; }
    .file-section { margin: 16px 0; }
    .file-label { display: block; margin-bottom: 8px; font-weight: 500; color: #666; }
    input[type="file"] { margin-bottom: 12px; }
    .image-preview { position: relative; display: inline-block; margin-top: 8px; }
    .image-preview img { max-width: 200px; max-height: 150px; border-radius: 8px; border: 1px solid #ddd; }
    .image-preview button { position: absolute; top: -8px; right: -8px; background: white; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
    .table-card { overflow-x: auto; }
    table { width: 100%; }
    .table-img { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; }
    .table-initials { width: 50px; height: 50px; background: #e8eaf6; color: #3f51b5; font-weight: bold; display: flex; align-items: center; justify-content: center; border-radius: 4px; }
  `]
})
export class ManageProductsComponent implements OnInit {
  products: Product[] = []; productForm!: FormGroup; showForm = false; editingProduct: Product | null = null;
  selectedFile: File | null = null; imagePreview: string | null = null;
  displayedColumns = ['image', 'name', 'category', 'price', 'stock', 'actions'];
  categories: Category[] = [];
  totalProducts = 0; pageSize = 10; currentPage = 0; isLoading = false;
  constructor(private fb: FormBuilder, private productService: ProductService, private categoryService: CategoryService, private toastr: ToastrService) {}
  ngOnInit(): void { this.initForm(); this.loadCategories(); this.loadProducts(); }
  loadCategories(): void { this.categoryService.getCategories().subscribe(cats => this.categories = cats || []); }
  initForm(): void {
    this.productForm = this.fb.group({ name: ['', Validators.required], description: ['', Validators.required], price: [0, [Validators.required, Validators.min(0.01)]], categoryId: ['', Validators.required], stock: [0, [Validators.required, Validators.min(0)]] });
  }
  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts(this.currentPage + 1, this.pageSize).subscribe(res => {
      this.products = res.products;
      this.totalProducts = res.pagination?.total || 0;
      this.isLoading = false;
    });
  }
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }
  openForm(): void { this.showForm = true; this.editingProduct = null; this.selectedFile = null; this.imagePreview = null; this.productForm.reset({ price: 0, stock: 0 }); }
  editProduct(product: Product): void {
    this.editingProduct = product;
    this.showForm = true;
    this.selectedFile = null;
    this.imagePreview = product.image || null;
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      stock: product.stock
    });
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => { this.imagePreview = reader.result as string; };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  removeImage(): void { this.selectedFile = null; this.imagePreview = null; }
  cancelForm(): void { this.showForm = false; this.editingProduct = null; this.selectedFile = null; this.imagePreview = null; this.productForm.reset({ price: 0, stock: 0 }); }
  saveProduct(): void {
    if (this.productForm.invalid) return;
    const formData = new FormData();
    formData.append('name', this.productForm.value.name);
    formData.append('description', this.productForm.value.description);
    formData.append('price', this.productForm.value.price.toString());
    formData.append('stock', this.productForm.value.stock.toString());
    formData.append('categoryId', this.productForm.value.categoryId);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    if (this.editingProduct) {
      this.productService.updateProduct(this.editingProduct.id, formData as any).subscribe({ next: () => { this.toastr.success('Product updated'); this.cancelForm(); this.loadProducts(); }, error: () => this.toastr.error('Failed to update product') });
    } else {
      this.productService.createProduct(formData).subscribe({ next: () => { this.toastr.success('Product created'); this.cancelForm(); this.loadProducts(); }, error: () => this.toastr.error('Failed to create product') });
    }
  }
  deleteProduct(product: Product): void {
    Swal.fire({
      title: 'Delete Product?',
      text: `Are you sure you want to delete "${product.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result:any) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => { Swal.fire('Deleted!', 'Product has been deleted.', 'success'); this.loadProducts(); },
          error: () => Swal.fire('Error', 'Failed to delete product', 'error')
        });
      }
    });
  }
  getCategoryName(category: Product['category']): string {
    if (!category) return '';
    return typeof category === 'string' ? category : category.name;
  }
}
