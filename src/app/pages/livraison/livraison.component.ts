import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-livraison',
  standalone: true,
  imports: [],
  templateUrl: './livraison.component.html',
  styleUrls: ['./livraison.component.css']
})
export class LivraisonComponent implements OnInit {
  private seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'Livraison',
      description: 'Politique de livraison. Livraison gratuite > 600 MAD. 2-4 jours Casablanca.',
      url: '/livraison'
    });
  }
}
