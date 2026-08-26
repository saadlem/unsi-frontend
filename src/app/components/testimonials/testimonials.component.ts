import { Component } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css'
})
export class TestimonialsComponent {
  testimonials = [
    {
      quote: 'La qualité est incroyable ! Chaque pièce est vraiment unique. Livraison rapide à Casablanca.',
      name: 'Sarah M.',
      stars: 5
    },
    {
      quote: "J'ai acheté le coffret luxe pour un cadeau. Absolument magnifique, ma famille était ravie.",
      name: 'Ahmed B.',
      stars: 5
    },
    {
      quote: 'Les motifs sont superbement faits. On sent l\'artisanat dans chaque détail. Je recommande vivement.',
      name: 'Fatima Z.',
      stars: 5
    }
  ];
}
