import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService } from '../../services/translate.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';
import { Tilt3dDirective } from '../../directives/tilt-3d.directive';

interface StorySlide {
  src: string;
  titleKey: string;
  captionKey: string;
  label: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, TranslatePipe, Tilt3dDirective],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit, OnDestroy {
  ts = inject(TranslateService);
  private seo = inject(SeoService);

  readonly slides: StorySlide[] = [
    {
      src: 'assets/story/bd/panel-01.jpg',
      titleKey: 'hero.story1Title',
      captionKey: 'hero.story1',
      label: '01'
    },
    {
      src: 'assets/story/bd/panel-02.jpg',
      titleKey: 'hero.story2Title',
      captionKey: 'hero.story2',
      label: '02'
    },
    {
      src: 'assets/story/bd/panel-03.jpg',
      titleKey: 'hero.story3Title',
      captionKey: 'hero.story3',
      label: '03'
    },
    {
      src: 'assets/story/bd/panel-04.jpg',
      titleKey: 'hero.story4Title',
      captionKey: 'hero.story4',
      label: '04'
    },
    {
      src: 'assets/story/bd/panel-05.jpg',
      titleKey: 'hero.story5Title',
      captionKey: 'hero.story5',
      label: '05'
    }
  ];

  active = signal(0);

  private timer: ReturnType<typeof setInterval> | null = null;
  private reducedMotion = false;

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'UNSI — L’âme d’UNSI',
      description: 'La vie est faite de petits moments. Rendons-les beaux.',
      url: '/',
      keywords: 'UNSI, L’âme d’UNSI, home objects, warmer everyday'
    });
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!this.reducedMotion) {
      this.startAutoplay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  goTo(index: number): void {
    this.active.set(index);
    if (!this.reducedMotion) this.startAutoplay();
  }

  next(): void {
    this.active.update((i) => (i + 1) % this.slides.length);
    if (!this.reducedMotion) this.startAutoplay();
  }

  prev(): void {
    this.active.update((i) => (i - 1 + this.slides.length) % this.slides.length);
    if (!this.reducedMotion) this.startAutoplay();
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.timer = setInterval(() => {
      this.active.update((i) => (i + 1) % this.slides.length);
    }, 7000);
  }

  private stopAutoplay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
