import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private api = inject(ApiService);
  stats: any = null;

  ngOnInit(): void {
    this.api.adminGetOrderStats().subscribe(s => this.stats = s);
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
    if (!this.stats?.revenueByDay?.length) return 1;
    return Math.max(...this.stats.revenueByDay.map((r: any) => Number(r.revenue)));
  }

  getBarHeight(revenue: number): number {
    return (Number(revenue) / this.getMaxRevenue()) * 100;
  }

  getMaxSold(): number {
    if (!this.stats?.topProducts?.length) return 1;
    return Math.max(...this.stats.topProducts.map((p: any) => Number(p.total_sold)));
  }
}
