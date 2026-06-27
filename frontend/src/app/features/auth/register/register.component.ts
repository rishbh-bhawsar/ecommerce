import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatFormFieldModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="auth-icon">person_add</mat-icon>
            <h2>Create Account</h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter your name">
              <mat-icon matPrefix>person</mat-icon>
              <mat-error>Name is required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Enter your email">
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">Enter a valid email</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">Password is required</mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">Password must be at least 6 characters</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="confirmPassword">
              <mat-icon matPrefix>lock_outline</mat-icon>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">Confirm password is required</mat-error>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('mismatch')">Passwords do not match</mat-error>
            </mat-form-field>
            <div class="error-message" *ngIf="errorMessage">
              <mat-icon>error</mat-icon> {{ errorMessage }}
            </div>
            <button mat-raised-button color="primary" type="submit" class="full-width" [disabled]="registerForm.invalid || isLoading">
              {{ isLoading ? 'Creating Account...' : 'Create Account' }}
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions align="end">
          <span>Already have an account?</span>
          <a mat-button color="primary" routerLink="/login">Sign In</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 64px); padding: 20px; }
    .auth-card { max-width: 420px; width: 100%; padding: 20px; }
    .auth-card mat-card-header { justify-content: center; margin-bottom: 20px; }
    .auth-card mat-card-title { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .auth-icon { font-size: 48px; width: 48px; height: 48px; color: #3f51b5; }
    .full-width { width: 100%; }
    .error-message { color: #f44336; display: flex; align-items: center; gap: 4px; margin-bottom: 16px; font-size: 14px; }
    mat-card-actions { display: flex; align-items: center; justify-content: center; gap: 4px; padding-top: 16px; }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    if (password !== confirm) form.get('confirmPassword')?.setErrors({ mismatch: true });
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    const { confirmPassword, ...registerData } = this.registerForm.value;
    this.authService.register(registerData).subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err) => { this.errorMessage = err.message; this.isLoading = false; }
    });
  }
}
