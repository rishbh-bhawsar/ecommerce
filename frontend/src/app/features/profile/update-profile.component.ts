import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatFormFieldModule],
  template: `
    <div class="update-container">
      <mat-card class="update-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="update-icon">edit</mat-icon>
            <h2>Update Profile</h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter your name">
              <mat-icon matPrefix>person</mat-icon>
              <mat-error *ngIf="profileForm.get('name')?.hasError('required')">Name is required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Enter your email">
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="profileForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="profileForm.get('email')?.hasError('email')">Enter a valid email</mat-error>
            </mat-form-field>
            <div class="error-message" *ngIf="errorMessage">
              <mat-icon>error</mat-icon> {{ errorMessage }}
            </div>
            <div class="success-message" *ngIf="successMessage">
              <mat-icon>check_circle</mat-icon> {{ successMessage }}
            </div>
            <div class="button-group">
              <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid || isLoading">
                {{ isLoading ? 'Updating...' : 'Update Profile' }}
              </button>
              <a mat-stroked-button routerLink="/profile">Cancel</a>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .update-container { max-width: 80%; margin: 24px auto; padding: 0 16px; }
    .update-card { padding: 20px; }
    .update-card mat-card-header { justify-content: center; margin-bottom: 24px; }
    .update-card mat-card-title { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .update-icon { font-size: 48px; width: 48px; height: 48px; color: #3f51b5; }
    .full-width { width: 100%; }
    .error-message { color: #f44336; display: flex; align-items: center; gap: 4px; margin-bottom: 16px; font-size: 14px; }
    .success-message { color: #4caf50; display: flex; align-items: center; gap: 4px; margin-bottom: 16px; font-size: 14px; }
    .button-group { display: flex; gap: 12px; justify-content: center; margin-top: 16px; }
  `]
})
export class UpdateProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.userService.updateUser(user.id, this.profileForm.value).subscribe({
      next: (updatedUser) => {
        this.authService.updateCurrentUser({ ...user, ...updatedUser });
        this.successMessage = 'Profile updated successfully!';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }
}