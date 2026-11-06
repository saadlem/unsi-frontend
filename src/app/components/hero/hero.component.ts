import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService } from '../../services/translate.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';

interface StorySlide {
  src: string;
  captionKey: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit, OnDestroy {
  ts = inject(TranslateService);
  private seo = inject(SeoService);

  slides: StorySlide[] = [
    {
      src: 'assets/story/story-01-walking.jpg',
      captionKey: 'hero.story1'
    },
    {
      src: 'assets/story/story-02-finds-unsi.jpg',
      captionKey: 'hero.story2'
    },
    {
      src: 'assets/story/story-03-browsing.jpg',
      captionKey: 'hero.story3'
    }
  ];

  active = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'UNSI — Objects for a warmer everyday',
      description: 'Thoughtful details, joyful living. Objects for a warmer everyday. Coming soon from Morocco.',
      url: '/',
      keywords: 'UNSI, home objects, Morocco, warm everyday, thoughtful details'
    });
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  goTo(index: number): void {
    this.active.set(index);
    this.startAutoplay();
  }

  next(): void {
    this.active.update((i) => (i + 1) % this.slides.length);
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.timer = setInterval(() => this.next(), 4500);
  }

  private stopAutoplay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
