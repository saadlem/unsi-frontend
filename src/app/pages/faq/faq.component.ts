import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {
  private seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'Questions Fréquentes',
      description: 'FAQ : commandes, livraison, paiement, retours.',
      url: '/faq'
    });
  }

  openIndex: number | null = null;

  faqItems = [
    {
      question: 'Comment passer une commande ?',
      answer: 'Ajoutez vos produits au panier, remplissez vos informations et confirmez. Vous recevrez un email de confirmation.'
    },
    {
      question: 'Quels sont les délais de livraison ?',
      answer: '2-4 jours pour Casablanca, 4-7 jours pour les autres villes du Maroc.'
    },
    {
      question: 'Comment puis-je payer ?',
      answer: 'Nous acceptons le paiement à la livraison uniquement. Payez en espèces lors de la réception.'
    },
    {
      question: 'Puis-je retourner un produit ?',
      answer: 'Oui, sous 14 jours si le produit est dans son état d\'origine. Contactez-nous à hello@unsi.store.'
    },
    {
      question: 'Les pièces sont-elles vraiment faites à la main ?',
      answer: 'Oui, chaque pièce est façonnée et peinte à la main par nos artisans au Maroc.'
    },
    {
      question: 'Livrez-vous en dehors du Maroc ?',
      answer: 'Pour l\'instant, nous livrons uniquement au Maroc. Contactez-nous pour les commandes internationales.'
    }
  ];

  toggle(index: number) {
    this.openIndex = this.openIndex === index ? null : index;
  }
}
