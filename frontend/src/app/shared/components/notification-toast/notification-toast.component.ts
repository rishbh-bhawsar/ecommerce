import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../core/services/socket.service';
import { Notification } from '../../../models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: ``
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  private subscription!: Subscription;
  constructor(private socketService: SocketService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.subscription = this.socketService.notifications$.subscribe(
      (notifications: Notification[]) => {
        if (notifications.length > 0) {
          const latest = notifications[0];
          if (latest.type === 'product-deleted') {
            this.toastr.error(latest.message, 'Product Deleted');
          } else {
            this.toastr.success(latest.message, 'Notification');
          }
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
