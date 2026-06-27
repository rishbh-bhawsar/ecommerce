import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { NotificationToastComponent } from './components/notification-toast/notification-toast.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@NgModule({
  imports: [CommonModule, RouterModule, NavbarComponent, LoadingSpinnerComponent, NotificationToastComponent, SidebarComponent],
  exports: [NavbarComponent, LoadingSpinnerComponent, NotificationToastComponent, SidebarComponent]
})
export class SharedModule {}
