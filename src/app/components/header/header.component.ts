import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { TranslateService, Lang } from '../../services/translate.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, UpperCasePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);
  ts = inject(TranslateService);
  mobileMenuOpen = false;
  langOpen = false;

  toggleMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleLang(): void {
    this.langOpen = !this.langOpen;
  }

  setLang(l: Lang): void {
    this.ts.setLang(l);
    this.langOpen = false;
  }
}
