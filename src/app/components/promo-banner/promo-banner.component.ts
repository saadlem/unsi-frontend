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
  banner: any = { enabled: 1, message: '', link: '', text_color: '#FFFFFF', background: '#0D47A1' };
  visible = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (localStorage.getItem('promo-banner-closed') === 'true') {
      this.visible = false;
    }
    this.http.get<any>('/api/banner').subscribe(data => {
      this.banner = data;
    });
  }

  dismiss(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.visible = false;
    localStorage.setItem('promo-banner-closed', 'true');
  }
}
