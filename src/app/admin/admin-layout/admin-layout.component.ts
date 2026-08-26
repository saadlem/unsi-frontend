import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private notifService = inject(NotificationService);
  private router = inject(Router);

  sidebarOpen = false;
  sidebarCollapsed = false;
  notifPanelOpen = false;

  get notifications() { return this.notifService.notifications(); }
  get unreadCount() { return this.notifService.unreadCount(); }

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/account']);
      return;
    }
    this.auth.checkAuth().subscribe();
    this.notifService.connect();
  }

  ngOnDestroy(): void {
    this.notifService.disconnect();
  }

  toggleNotifPanel(): void {
    this.notifPanelOpen = !this.notifPanelOpen;
    if (this.notifPanelOpen) {
      this.notifService.markAllRead();
    }
  }

  formatTime(date: Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  logout(): void {
    this.notifService.disconnect();
    this.auth.logout();
  }
}
