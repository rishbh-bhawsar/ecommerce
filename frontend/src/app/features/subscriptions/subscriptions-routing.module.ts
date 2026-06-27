import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionPlansComponent } from './subscription-plans/subscription-plans.component';
import { MySubscriptionsComponent } from './my-subscriptions/my-subscriptions.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { path: 'plans', component: SubscriptionPlansComponent },
  { path: 'my', component: MySubscriptionsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'plans', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionsRoutingModule {}
