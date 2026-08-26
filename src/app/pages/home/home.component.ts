import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../../components/hero/hero.component';
import { PromoBannerComponent } from '../../components/promo-banner/promo-banner.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { InstagramFeedComponent } from '../../components/instagram-feed/instagram-feed.component';

interface SiteStatus {
  mode: string;
  title: string;
  message: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroComponent, PromoBannerComponent, TestimonialsComponent, InstagramFeedComponent],
  template: `
    @if (status()) {
      <div class="status-overlay">
        <div class="status-content">
          <div class="status-icon">{{ status()!.icon }}</div>
          <h1 class="status-title" [style.color]="status()!.color">{{ status()!.title }}</h1>
          <p class="status-message">{{ status()!.message }}</p>
          <div class="status-brand">UNSI Céramique</div>
        </div>
      </div>
    }
    <app-promo-banner />
    <app-hero />
    <app-testimonials />
    <app-instagram-feed />
  `,
  styles: [`
    .status-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.95);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.5s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .status-content {
      text-align: center;
      padding: 40px;
      max-width: 500px;
    }
    .status-icon {
      font-size: 72px;
      margin-bottom: 24px;
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    .status-title {
      font-size: 36px;
      font-weight: 800;
      margin: 0 0 12px;
    }
    .status-message {
      font-size: 18px;
      color: #5E5A54;
      line-height: 1.6;
      margin: 0 0 32px;
    }
    .status-brand {
      font-size: 22px;
      font-weight: 700;
      color: #0D47A1;
      letter-spacing: 2px;
    }
  `]
})
export class HomeComponent implements OnInit {
  status = signal<SiteStatus | null>(null);

  ngOnInit() {
    const w = window as any;
    if (w.__SITE_STATUS) {
      this.status.set(w.__SITE_STATUS);
    }
  }
}
