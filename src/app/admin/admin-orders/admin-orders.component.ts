import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, TitleCasePipe, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css'
})
export class AdminOrdersComponent implements OnInit {
  private api = inject(ApiService);
  orders: any[] = [];
  filterStatus = 'all';

  statuses = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.api.adminGetOrders(this.filterStatus).subscribe(o => this.orders = o);
  }

  onFilterChange(): void {
    this.loadOrders();
  }

  getStatusCount(status: string): number {
    if (status === 'all') return this.orders.length;
    return this.orders.filter(o => o.status === status).length;
  }
}
