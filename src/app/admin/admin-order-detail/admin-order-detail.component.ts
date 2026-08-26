import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DecimalPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, TitleCasePipe, FormsModule],
  templateUrl: './admin-order-detail.component.html',
  styleUrl: './admin-order-detail.component.css'
})
export class AdminOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  order: any = null;
  newStatus = '';
  notes = '';
  saving = false;

  statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.adminGetOrder(id).subscribe({
      next: (order) => {
        this.order = order;
        this.newStatus = order.status;
        this.notes = order.notes || '';
      },
      error: () => this.router.navigate(['/admin/orders'])
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'pending', confirmed: 'confirmed', shipped: 'shipped',
      delivered: 'delivered', cancelled: 'cancelled'
    };
    return map[status] || 'pending';
  }

  save(): void {
    this.saving = true;
    this.api.adminUpdateOrder(this.order.id, { status: this.newStatus, notes: this.notes }).subscribe({
      next: (updated) => {
        this.order = updated;
        this.saving = false;
      },
      error: () => this.saving = false
    });
  }

  deleteOrder(): void {
    if (confirm(`Delete order ${this.order.id}?`)) {
      this.api.adminDeleteOrder(this.order.id).subscribe(() => {
        this.router.navigate(['/admin/orders']);
      });
    }
  }
}
