import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { TranslateService, Lang } from '../../services/translate.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { PagesService } from '../../services/pages.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, UpperCasePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);
  ts = inject(TranslateService);
  pagesService = inject(PagesService);
  mobileMenuOpen = false;
  langOpen = false;

  ngOnInit(): void {
    this.pagesService.ensureLoaded().subscribe();
  }

  toggleMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.langOpen = false;
    }
    if (typeof document !== 'undefined') {
      document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
    }
  }

  closeMenu(): void {
    this.mobileMenuOpen = false;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  toggleLang(): void {
    this.langOpen = !this.langOpen;
  }

  setLang(l: Lang): void {
    this.ts.setLang(l);
    this.langOpen = false;
  }

  isOn(slug: string): boolean {
    return this.pagesService.isEnabled(slug);
  }

  /** Prefer i18n key for API page labels (API stores French only). */
  pageLabel(slug: string, fallback: string): string {
    return this.ts.pageKey(slug) || fallback;
  }
}
