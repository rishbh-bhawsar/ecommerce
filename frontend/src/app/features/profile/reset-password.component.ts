import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatFormFieldModule],
  template: `
    <div class="reset-container">
      <mat-card class="reset-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="reset-icon">lock_reset</mat-icon>
            <h2>Reset Password</h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Current Password</mat-label>
              <input matInput [type]="hideCurrentPassword ? 'password' : 'text'" formControlName="currentPassword">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hideCurrentPassword = !hideCurrentPassword">
                <mat-icon>{{hideCurrentPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error>Current password is required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>New Password</mat-label>
              <input matInput [type]="hideNewPassword ? 'password' : 'text'" formControlName="newPassword">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hideNewPassword = !hideNewPassword">
                <mat-icon>{{hideNewPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="resetForm.get('newPassword')?.hasError('required')">New password is required</mat-error>
              <mat-error *ngIf="resetForm.get('newPassword')?.hasError('minlength')">Password must be at least 6 characters</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm New Password</mat-label>
              <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hideConfirmPassword = !hideConfirmPassword">
                <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="resetForm.get('confirmPassword')?.hasError('required')">Please confirm your password</mat-error>
              <mat-error *ngIf="resetForm.get('confirmPassword')?.hasError('passwordMismatch')">Passwords do not match</mat-error>
            </mat-form-field>
            <div class="error-message" *ngIf="errorMessage">
              <mat-icon>error</mat-icon> {{ errorMessage }}
            </div>
            <div class="success-message" *ngIf="successMessage">
              <mat-icon>check_circle</mat-icon> {{ successMessage }}
            </div>
            <div class="button-group">
              <button mat-raised-button color="primary" type="submit" [disabled]="resetForm.invalid || isLoading">
                {{ isLoading ? 'Resetting...' : 'Reset Password' }}
              </button>
              <a mat-stroked-button routerLink="/profile">Cancel</a>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .reset-container { max-width: 80%; margin: 24px auto; padding: 0 16px; }
    .reset-card { padding: 20px; }
    .reset-card mat-card-header { justify-content: center; margin-bottom: 24px; }
    .reset-card mat-card-title { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .reset-icon { font-size: 48px; width: 48px; height: 48px; color: #3f51b5; }
    .full-width { width: 100%; }
    .error-message { color: #f44336; display: flex; align-items: center; gap: 4px; margin-bottom: 16px; font-size: 14px; }
    .success-message { color: #4caf50; display: flex; align-items: center; gap: 4px; margin-bottom: 16px; font-size: 14px; }
    .button-group { display: flex; gap: 12px; justify-content: center; margin-top: 16px; }
  `]
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.resetForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { currentPassword, newPassword } = this.resetForm.value;
    const token = this.authService.getToken();

    this.http.post<any>('http://localhost:3000/api/auth/reset-password', { token, password: newPassword }).subscribe({
      next: () => {
        this.successMessage = 'Password reset successfully!';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to reset password';
        this.isLoading = false;
      }
    });
  }
}