import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Tilt3dDirective } from '../../directives/tilt-3d.directive';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, DecimalPipe, TranslatePipe, Tilt3dDirective],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);
  added = false;

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.toggle(this.product.id);
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addToCart(this.product);
    this.added = true;
    setTimeout(() => this.added = false, 1500);
  }
}
