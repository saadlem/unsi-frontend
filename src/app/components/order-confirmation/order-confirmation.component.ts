import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, TranslatePipe],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.css'
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  order: any = null;

  ngOnInit(): void {
    const orderId = this.route.snapshot.queryParamMap.get('id');
    if (orderId) {
      this.order = {
        id: orderId,
        total: 0,
        status: 'Confirmed - Cash on Delivery',
        items: [],
        customer: { address: '', city: '' }
      };
    }
  }
}
