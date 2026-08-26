import { Injectable, NgZone, signal } from '@angular/core';

export interface Notification {
  id: number;
  type: string;
  message: string;
  data: any;
  time: Date;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private eventSource: EventSource | null = null;
  private counter = 0;

  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);

  constructor(private zone: NgZone) {}

  connect(): void {
    if (this.eventSource) return;

    this.eventSource = new EventSource('/api/notifications');

    this.eventSource.addEventListener('new_order', (event) => {
      this.zone.run(() => {
        const data = JSON.parse(event.data);
        const notif: Notification = {
          id: ++this.counter,
          type: 'new_order',
          message: `New order ${data.id} from ${data.first_name} ${data.last_name} - ${data.total} MAD`,
          data,
          time: new Date(),
          read: false
        };
        this.notifications.update(n => [notif, ...n]);
        this.unreadCount.update(c => c + 1);
      });
    });

    this.eventSource.addEventListener('order_updated', (event) => {
      this.zone.run(() => {
        const data = JSON.parse(event.data);
        const notif: Notification = {
          id: ++this.counter,
          type: 'order_updated',
          message: `Order ${data.id} updated to: ${data.status}`,
          data,
          time: new Date(),
          read: false
        };
        this.notifications.update(n => [notif, ...n]);
        this.unreadCount.update(c => c + 1);
      });
    });
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }

  markAsRead(id: number): void {
    this.notifications.update(n => n.map(notif => notif.id === id ? { ...notif, read: true } : notif));
    this.unreadCount.update(c => Math.max(0, c - 1));
  }

  markAllRead(): void {
    this.notifications.update(n => n.map(notif => ({ ...notif, read: true })));
    this.unreadCount.set(0);
  }
}
