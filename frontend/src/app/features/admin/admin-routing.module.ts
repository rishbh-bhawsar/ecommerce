import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { ManageProductsComponent } from './manage-products/manage-products.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ManageOrdersComponent } from './manage-orders/manage-orders.component';
import { ManagePlansComponent } from './manage-plans/manage-plans.component';
import { ManageSubscriptionsComponent } from './manage-subscriptions/manage-subscriptions.component';
import { AdminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: 'products', component: ManageProductsComponent, canActivate: [AdminGuard] },
  { path: 'users', component: ManageUsersComponent, canActivate: [AdminGuard] },
  { path: 'orders', component: ManageOrdersComponent, canActivate: [AdminGuard] },
  { path: 'plans', component: ManagePlansComponent, canActivate: [AdminGuard] },
  { path: 'subscriptions', component: ManageSubscriptionsComponent, canActivate: [AdminGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
