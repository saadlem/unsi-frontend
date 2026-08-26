import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem, CustomerInfo } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = '/api/orders';

  createOrder(items: CartItem[], total: number, customer: CustomerInfo, discountCode?: string): Observable<any> {
    const orderItems = items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.image,
      quantity: item.quantity,
      price: item.product.price
    }));

    return this.http.post(this.apiUrl, {
      items: orderItems,
      customer,
      discountCode: discountCode || null
    });
  }
}
