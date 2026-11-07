import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-promo-banner',
  standalone: true,
  imports: [],
  templateUrl: './promo-banner.component.html',
  styleUrl: './promo-banner.component.css'
})
export class PromoBannerComponent implements OnInit {
  banner: any = {
    enabled: 1,
    message: 'Objets pour un quotidien plus chaleureux — UNSI',
    link: '/products',
    text_color: '#FFF7FB',
    background: 'linear-gradient(90deg, #E85A7A, #B83258)'
  };
  visible = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (localStorage.getItem('promo-banner-closed') === 'true') {
      this.visible = false;
    }
    this.http.get<any>('/api/banner').subscribe({
      next: (data) => {
        if (data?.message) this.banner = { ...this.banner, ...data };
      },
      error: () => undefined
    });
  }

  dismiss(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.visible = false;
    localStorage.setItem('promo-banner-closed', 'true');
  }
}
