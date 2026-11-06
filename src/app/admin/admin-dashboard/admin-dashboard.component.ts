import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';

const EMPTY_STATS = {
  totalOrders: 0,
  totalRevenue: 0,
  pendingOrders: 0,
  deliveredOrders: 0,
  totalProducts: 0,
  lowStock: 0,
  recentOrders: [] as any[],
  revenueByDay: Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return { date: d.toISOString(), revenue: 0, orders: 0 };
  }),
  topProducts: [] as any[]
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private api = inject(ApiService);
  stats = signal<any>(EMPTY_STATS);
  loaded = signal(false);

  ngOnInit(): void {
    this.api.adminGetOrderStats().subscribe({
      next: (s) => {
        this.stats.set({ ...EMPTY_STATS, ...s });
        this.loaded.set(true);
      },
      error: () => {
        this.stats.set(EMPTY_STATS);
        this.loaded.set(true);
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'pending',
      confirmed: 'confirmed',
      shipped: 'shipped',
      delivered: 'delivered',
      cancelled: 'cancelled'
    };
    return map[status] || 'pending';
  }

  getMaxRevenue(): number {
    const days = this.stats()?.revenueByDay;
    if (!days?.length) return 1;
    return Math.max(1, ...days.map((r: any) => Number(r.revenue) || 0));
  }

  getBarHeight(revenue: number): number {
    const max = this.getMaxRevenue();
    const value = ((Number(revenue) || 0) / max) * 100;
    return Number.isFinite(value) ? value : 0;
  }

  getMaxSold(): number {
    const products = this.stats()?.topProducts;
    if (!products?.length) return 1;
    return Math.max(1, ...products.map((p: any) => Number(p.total_sold) || 0));
  }
}
