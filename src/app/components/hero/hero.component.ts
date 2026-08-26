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
      title: 'UNSI Céramique — Artisanat Marocain | Gobelets & Assiettes',
      description: 'Céramique artisanale marocaine façonnée à la main. Gobelets, assiettes, bols et coffrets. Livraison au Maroc.',
      url: '/',
      keywords: 'céramique marocaine, artisanat, gobelet, assiette, fait main'
    });
  }
}
