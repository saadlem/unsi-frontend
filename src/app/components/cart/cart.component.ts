import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, DecimalPipe, TranslatePipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cartService = inject(CartService);

  increase(productId: number, currentQty: number): void {
    this.cartService.updateQuantity(productId, currentQty + 1);
  }

  decrease(productId: number, currentQty: number): void {
    this.cartService.updateQuantity(productId, currentQty - 1);
  }

  remove(productId: number): void {
    this.cartService.removeFromCart(productId);
  }
}
