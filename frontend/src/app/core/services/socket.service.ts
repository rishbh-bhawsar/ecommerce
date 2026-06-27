import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification } from '../../models';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private readonly SOCKET_URL = 'http://localhost:3000';

  constructor() {
    this.socket = io(this.SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling']
    });
  }

  connect(token: string): void {
    this.socket.io.opts.extraHeaders = { Authorization: `Bearer ${token}` };
    this.socket.connect();

    this.socket.on('product-added', (data: any) => {
      this.addNotification({
        id: Date.now().toString(),
        message: `New product added: ${data.name || 'Unknown'}`,
        type: 'product-added',
        timestamp: new Date()
      });
    });

    this.socket.on('product-deleted', (data: any) => {
      this.addNotification({
        id: Date.now().toString(),
        message: `Product removed: ${data.name || 'Unknown'}`,
        type: 'product-deleted',
        timestamp: new Date()
      });
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  on(event: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(event, (data) => observer.next(data));
      return () => this.socket.off(event);
    });
  }

  emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  private addNotification(notification: Notification): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current].slice(0, 20));
  }

  dismissNotification(id: string): void {
    const current = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(current);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
