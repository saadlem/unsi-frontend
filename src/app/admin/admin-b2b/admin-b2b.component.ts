import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface B2bQuote {
  id: number;
  company: string;
  contactName: string;
  email: string;
  phone?: string;
  city?: string;
  message?: string;
  lines: Array<{ label: string; quantity: number; unitPrice: number; lineTotal: number }>;
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  totalQty: number;
  status: string;
  created_at: string;
}

@Component({
  selector: 'app-admin-b2b',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './admin-b2b.component.html',
  styleUrl: './admin-b2b.component.css'
})
export class AdminB2bComponent implements OnInit {
  private http = inject(HttpClient);

  quotes: B2bQuote[] = [];
  loading = true;
  selected: B2bQuote | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.http.get<B2bQuote[]>('/api/admin/b2b-quotes').subscribe({
      next: (data) => {
        this.quotes = data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  open(quote: B2bQuote): void {
    this.selected = quote;
  }

  close(): void {
    this.selected = null;
  }

  setStatus(quote: B2bQuote, status: string): void {
    this.http.put<B2bQuote>(`/api/admin/b2b-quotes/${quote.id}`, { status }).subscribe({
      next: (updated) => {
        this.quotes = this.quotes.map((q) => (q.id === updated.id ? updated : q));
        if (this.selected?.id === updated.id) this.selected = updated;
      }
    });
  }

  remove(quote: B2bQuote): void {
    if (!confirm(`Supprimer la demande de ${quote.company} ?`)) return;
    this.http.delete(`/api/admin/b2b-quotes/${quote.id}`).subscribe({
      next: () => {
        this.quotes = this.quotes.filter((q) => q.id !== quote.id);
        if (this.selected?.id === quote.id) this.selected = null;
      }
    });
  }
}
