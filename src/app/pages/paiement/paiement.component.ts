import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [],
  templateUrl: './paiement.component.html',
  styleUrls: ['./paiement.component.css']
})
export class PaiementComponent implements OnInit {
  private seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'Paiement à la Livraison',
      description: 'Payez en espèces à la réception. Aucune donnée bancaire requise.',
      url: '/paiement'
    });
  }
}
