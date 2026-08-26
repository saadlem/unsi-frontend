import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css']
})
export class TrackingComponent implements OnInit {
  private http = inject(HttpClient);
  private seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'Suivi de Commande',
      description: 'Suivez votre commande en temps réel.',
      url: '/suivi'
    });
  }

  orderNumber = '';
  loading = false;
  error = '';
  order: any = null;

  statuses = [
    { key: 'pending', label: 'En préparation' },
    { key: 'shipped', label: 'Expédié' },
    { key: 'delivered', label: 'Livré' }
  ];

  trackOrder() {
    const num = this.orderNumber.trim();
    if (!num) return;

    this.loading = true;
    this.error = '';
    this.order = null;

    this.http.get<any>(`/api/orders/track/${num}`).subscribe({
      next: (res) => {
        this.order = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'tracking.notFound';
        this.loading = false;
      }
    });
  }

  getStatusIndex(): number {
    if (!this.order) return -1;
    const status = this.order.status;
    if (status === 'delivered') return 2;
    if (status === 'shipped') return 1;
    return 0;
  }
}
