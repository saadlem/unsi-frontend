import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-banner',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-banner.component.html',
  styleUrl: './admin-banner.component.css'
})
export class AdminBannerComponent implements OnInit {
  private http = inject(HttpClient);

  banner: any = { enabled: 1, message: '', link: '', text_color: '#FFFFFF', background: '#A00812' };
  saving = false;
  saved = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    // Public read — avoids 401 with a stale admin JWT
    this.http.get<any>('/api/banner').subscribe({
      next: (data) => {
        this.banner = {
          ...this.banner,
          ...data,
          enabled: data?.enabled === true || data?.enabled === 1 || data?.enabled === '1' ? 1 : 0
        };
      }
    });
  }

  save(): void {
    this.saving = true;
    this.saved = false;
    const payload = {
      ...this.banner,
      enabled: this.banner.enabled ? 1 : 0
    };
    this.http.put<any>('/api/admin/banner', payload).subscribe({
      next: (data) => {
        this.banner = {
          ...this.banner,
          ...data,
          enabled: data?.enabled === true || data?.enabled === 1 || data?.enabled === '1' ? 1 : 0
        };
        this.saving = false;
        this.saved = true;
        // Allow storefront to show the banner again after an admin update
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('promo-banner-closed');
        }
        setTimeout(() => (this.saved = false), 3000);
      },
      error: (err) => {
        this.saving = false;
        if (err?.status === 401) {
          alert('Session expirée. Reconnectez-vous, puis réessayez.');
        }
      }
    });
  }
}
