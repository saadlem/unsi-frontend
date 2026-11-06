import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService } from '../../services/translate.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit {
  ts = inject(TranslateService);
  private seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'UNSI — Objects for a warmer everyday',
      description: 'Thoughtful details, joyful living. Objects for a warmer everyday. Coming soon from Morocco.',
      url: '/',
      keywords: 'UNSI, home objects, Morocco, warm everyday, thoughtful details'
    });
  }
}
