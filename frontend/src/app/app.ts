import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { AuthService } from './core/services/auth.service';
import { SocketService } from './core/services/socket.service';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <app-navbar></app-navbar>
    <app-loading-spinner></app-loading-spinner>
    <app-notification-toast></app-notification-toast>
    <div class="app-layout" *ngIf="authService.isAuthenticated()">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
    <main *ngIf="!authService.isAuthenticated()">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: calc(100vh - 64px);
      overflow: hidden;
    }
    .main-content {
      flex: 1;
      background: #f5f5f5;
      overflow-y: auto;
      overflow-x: hidden;
    }
    main {
      min-height: calc(100vh - 64px);
      background: #f5f5f5;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    public authService: AuthService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      const token = this.authService.getToken();
      if (token) {
        this.socketService.connect(token);
      }
    }
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}
