import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-promo-banner',
  standalone: true,
  imports: [],
  templateUrl: './promo-banner.component.html',
  styleUrl: './promo-banner.component.css'
})
export class PromoBannerComponent implements OnInit {
  private http = inject(HttpClient);

  banner: any = {
    enabled: false,
    message: '',
    link: '',
    text_color: '#FFF7FB',
    background: '#B83258'
  };
  visible = true;

  ngOnInit(): void {
    this.http.get<any>('/api/banner').subscribe({
      next: (data) => {
        if (!data) return;
        this.banner = {
          ...this.banner,
          ...data,
          enabled: data.enabled === true || data.enabled === 1 || data.enabled === '1',
          message: (data.message || '').trim()
        };
        this.visible = !this.isDismissed(this.banner.message);
      },
      error: () => undefined
    });
  }

  dismiss(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.visible = false;
    if (typeof localStorage !== 'undefined' && this.banner.message) {
      localStorage.setItem('promo-banner-closed', this.banner.message);
    }
  }

  private isDismissed(message: string): boolean {
    if (typeof localStorage === 'undefined' || !message) return false;
    return localStorage.getItem('promo-banner-closed') === message;
  }
}
