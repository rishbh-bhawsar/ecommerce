import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { ManageProductsComponent } from './manage-products/manage-products.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ManageOrdersComponent } from './manage-orders/manage-orders.component';
import { ManagePlansComponent } from './manage-plans/manage-plans.component';
import { ManageSubscriptionsComponent } from './manage-subscriptions/manage-subscriptions.component';

@NgModule({
  imports: [CommonModule, AdminRoutingModule, AdminDashboardComponent, ManageProductsComponent, ManageUsersComponent, ManageOrdersComponent, ManagePlansComponent, ManageSubscriptionsComponent]
})
export class AdminModule {}
