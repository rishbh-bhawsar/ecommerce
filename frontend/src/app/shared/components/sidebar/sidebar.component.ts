import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatDividerModule],
  template: `
    <div class="sidebar">
      <div class="sidebar-header">
        <mat-icon class="user-icon">account_circle</mat-icon>
        <div class="user-info">
          <span class="user-name">{{ userName }}</span>
          <span class="user-email">{{ userEmail }}</span>
        </div>
      </div>
      <mat-divider></mat-divider>
      <mat-nav-list>
        <a mat-list-item routerLink="/products" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}" (click)="onNavigation()">
          <mat-icon matListItemIcon>home</mat-icon>
          <span matListItemTitle>Home</span>
        </a>
        <a mat-list-item routerLink="/profile" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}" (click)="onNavigation()">
          <mat-icon matListItemIcon>person</mat-icon>
          <span matListItemTitle>Profile</span>
        </a>
        <a mat-list-item routerLink="/profile/update" routerLinkActive="active-link" (click)="onNavigation()">
          <mat-icon matListItemIcon>edit</mat-icon>
          <span matListItemTitle>Update Profile</span>
        </a>
        <a mat-list-item routerLink="/profile/reset-password" routerLinkActive="active-link" (click)="onNavigation()">
          <mat-icon matListItemIcon>lock_reset</mat-icon>
          <span matListItemTitle>Reset Password</span>
        </a>
        <mat-divider></mat-divider>
        <a mat-list-item routerLink="/about" routerLinkActive="active-link" (click)="onNavigation()">
          <mat-icon matListItemIcon>info</mat-icon>
          <span matListItemTitle>About Me</span>
        </a>
        <a mat-list-item routerLink="/privacy" routerLinkActive="active-link" (click)="onNavigation()">
          <mat-icon matListItemIcon>privacy_tip</mat-icon>
          <span matListItemTitle>Privacy & Policy</span>
        </a>
      </mat-nav-list>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      overflow: hidden;
    }
    .sidebar {
      width: 260px;
      height: 100%;
      background: white;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .sidebar-header {
      padding: 24px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f5f5f5;
      flex-shrink: 0;
    }
    .user-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #3f51b5;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .user-name {
      font-weight: 500;
      font-size: 16px;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .user-email {
      font-size: 12px;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    mat-nav-list {
      flex: 1;
      padding-top: 8px;
      overflow-y: auto;
      overflow-x: hidden;
    }
    :host ::ng-deep .mat-mdc-nav-list {
      padding: 0;
    }
    :host ::ng-deep a.mat-mdc-list-item {
      margin: 4px 8px;
      border-radius: 8px;
      height: 48px;
      overflow: hidden;
    }
    :host ::ng-deep a.mat-mdc-list-item.active-link {
      background: rgba(63, 81, 181, 0.1) !important;
      color: #3f51b5 !important;
    }
    :host ::ng-deep a.mat-mdc-list-item.active-link .mat-icon {
      color: #3f51b5 !important;
    }
    :host ::ng-deep a.mat-mdc-list-item.active-link .mdc-list-item__primary-text {
      color: #3f51b5 !important;
    }
    mat-divider {
      margin: 8px 0;
      flex-shrink: 0;
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  userName = '';
  userEmail = '';
  private userSub?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name;
        this.userEmail = user.email;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  onNavigation(): void {
  }
}