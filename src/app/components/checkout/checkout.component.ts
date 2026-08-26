import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { DiscountService } from '../../services/discount.service';
import { CustomerInfo } from '../../models/product.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe, TranslatePipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private discountService = inject(DiscountService);
  private router = inject(Router);

  customer: CustomerInfo = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  };

  discountCode = '';
  appliedDiscount = signal<{ code: string; type: string; value: number; amount: number } | null>(null);
  discountError = signal('');
  applyingDiscount = false;
  submitted = false;
  submitting = false;

  get subtotal(): number {
    return this.cartService.total();
  }

  get discountAmount(): number {
    return this.appliedDiscount()?.amount || 0;
  }

  get finalTotal(): number {
    return Math.max(0, this.subtotal - this.discountAmount);
  }

  applyDiscount(): void {
    if (!this.discountCode.trim()) return;
    this.applyingDiscount = true;
    this.discountError.set('');
    this.discountService.validate(this.discountCode, this.subtotal).subscribe({
      next: (res) => {
        this.appliedDiscount.set(res.discount);
        this.applyingDiscount = false;
      },
      error: (err) => {
        this.discountError.set(err.error?.error || 'Code invalide');
        this.appliedDiscount.set(null);
        this.applyingDiscount = false;
      }
    });
  }

  removeDiscount(): void {
    this.appliedDiscount.set(null);
    this.discountCode = '';
    this.discountError.set('');
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.isValid() || this.submitting) return;

    this.submitting = true;
    this.orderService.createOrder(
      this.cartService.items(),
      this.finalTotal,
      this.customer,
      this.appliedDiscount()?.code
    ).subscribe({
      next: (res) => {
        this.cartService.clearCart();
        this.router.navigate(['/order-confirmation'], {
          queryParams: { id: res.order.id }
        });
      },
      error: (err) => {
        this.submitting = false;
        alert('Failed to place order. Please try again.');
      }
    });
  }

  isValid(): boolean {
    return !!(
      this.customer.firstName.trim() &&
      this.customer.lastName.trim() &&
      this.customer.email.trim() &&
      this.customer.phone.trim() &&
      this.customer.address.trim() &&
      this.customer.city.trim() &&
      this.customer.zipCode.trim()
    );
  }
}
