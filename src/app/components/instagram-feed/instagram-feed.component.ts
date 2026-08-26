import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface InstagramPost {
  id: number;
  image_url: string;
  link: string;
  caption: string;
}

@Component({
  selector: 'app-instagram-feed',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './instagram-feed.component.html',
  styleUrl: './instagram-feed.component.css'
})
export class InstagramFeedComponent implements OnInit {
  private http = inject(HttpClient);
  images: InstagramPost[] = [];

  ngOnInit(): void {
    this.http.get<InstagramPost[]>('/api/instagram-posts').subscribe({
      next: (data) => this.images = data,
      error: () => this.images = []
    });
  }
}
