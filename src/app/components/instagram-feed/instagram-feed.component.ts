import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RevealDirective } from '../../directives/reveal.directive';

interface InstagramPost {
  id: number;
  image_url: string;
  link: string;
  caption: string;
}

@Component({
  selector: 'app-instagram-feed',
  standalone: true,
  imports: [TranslatePipe, RevealDirective],
  templateUrl: './instagram-feed.component.html',
  styleUrl: './instagram-feed.component.css'
})
export class InstagramFeedComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  images: InstagramPost[] = [];
  private intervalId: any;

  ngOnInit(): void {
    this.load();
    // Auto-refresh every 5 minutes so new IG posts appear without manual reload
    this.intervalId = setInterval(() => this.load(), 5 * 60 * 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private load(): void {
    // cache-bust to avoid CDN/browser cache
    const bust = Date.now();
    this.http.get<InstagramPost[]>(`/api/instagram-posts?_t=${bust}`).subscribe({
      next: (data) => this.images = data,
      error: () => this.images = []
    });
  }
}
