import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatFormFieldModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="auth-icon">lock</mat-icon>
            <h2>Login to E-Shop</h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Enter your email">
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Enter a valid email</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error>Password is required</mat-error>
            </mat-form-field>
            <div class="error-message" *ngIf="errorMessage">
              <mat-icon>error</mat-icon> {{ errorMessage }}
            </div>
            <button mat-raised-button color="primary" type="submit" class="full-width" [disabled]="loginForm.invalid || isLoading">
              {{ isLoading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions align="end">
          <span>Don't have an account?</span>
          <a mat-button color="primary" routerLink="/register">Register</a>
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
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';
  returnUrl = '/products';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/products';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.login(this.loginForm.value).subscribe({
      next: (res:any) => {this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => { this.errorMessage = err.message; this.isLoading = false; }
    });
  }
}
