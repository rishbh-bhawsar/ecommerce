import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="profile-icon">account_circle</mat-icon>
            <h2>My Profile</h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="profile-info" *ngIf="user">
            <div class="info-row">
              <mat-icon>person</mat-icon>
              <div class="info-content">
                <label>Name</label>
                <span>{{ user.name }}</span>
              </div>
            </div>
            <div class="info-row">
              <mat-icon>email</mat-icon>
              <div class="info-content">
                <label>Email</label>
                <span>{{ user.email }}</span>
              </div>
            </div>
            <div class="info-row">
              <mat-icon>badge</mat-icon>
              <div class="info-content">
                <label>Role</label>
                <span class="role-badge">{{ user.role | titlecase }}</span>
              </div>
            </div>
            <div class="info-row" *ngIf="user.createdAt">
              <mat-icon>calendar_today</mat-icon>
              <div class="info-content">
                <label>Member Since</label>
                <span>{{ user.createdAt | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <a mat-raised-button color="primary" routerLink="/profile/update">
            <mat-icon>edit</mat-icon> Update Profile
          </a>
          <a mat-stroked-button color="primary" routerLink="/profile/reset-password">
            <mat-icon>lock_reset</mat-icon> Reset Password
          </a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container { max-width: 80%; margin: 24px auto; padding: 0 16px; }
    .profile-card { padding: 20px; }
    .profile-card mat-card-header { justify-content: center; margin-bottom: 24px; }
    .profile-card mat-card-title { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .profile-icon { font-size: 64px; width: 64px; height: 64px; color: #3f51b5; }
    .profile-info { display: flex; flex-direction: column; gap: 16px; }
    .info-row { display: flex; align-items: center; gap: 16px; padding: 12px; background: #f5f5f5; border-radius: 8px; }
    .info-row mat-icon { color: #3f51b5; }
    .info-content { display: flex; flex-direction: column; }
    .info-content label { font-size: 12px; color: #666; margin-bottom: 4px; }
    .info-content span { font-size: 16px; color: #333; }
    .role-badge { background: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 16px; display: inline-block; width: fit-content; }
    mat-card-actions { display: flex; justify-content: center; gap: 12px; padding-top: 24px; }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }
}