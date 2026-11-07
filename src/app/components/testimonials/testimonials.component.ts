import { Component } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RevealDirective } from '../../directives/reveal.directive';
import { Tilt3dDirective } from '../../directives/tilt-3d.directive';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [TranslatePipe, RevealDirective, Tilt3dDirective],
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
