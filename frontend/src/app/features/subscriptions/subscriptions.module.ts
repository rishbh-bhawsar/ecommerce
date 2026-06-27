import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionsRoutingModule } from './subscriptions-routing.module';
import { SubscriptionPlansComponent } from './subscription-plans/subscription-plans.component';
import { MySubscriptionsComponent } from './my-subscriptions/my-subscriptions.component';

@NgModule({
  imports: [CommonModule, SubscriptionsRoutingModule, SubscriptionPlansComponent, MySubscriptionsComponent]
})
export class SubscriptionsModule {}
