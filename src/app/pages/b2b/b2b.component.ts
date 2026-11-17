import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';

interface ShapePrice {
  id: string;
  label: string;
  price: number;
}

interface QuoteLine {
  shapeId: string;
  quantity: number;
}

interface DiscountTier {
  minQty: number;
  rate: number;
  labelKey: string;
}

@Component({
  selector: 'app-b2b',
  standalone: true,
  imports: [FormsModule, TranslatePipe, DecimalPipe],
  templateUrl: './b2b.component.html',
  styleUrl: './b2b.component.css'
})
export class B2bComponent implements OnInit {
  private seo = inject(SeoService);
  private http = inject(HttpClient);

  readonly tiers: DiscountTier[] = [
    { minQty: 100, rate: 0.2, labelKey: 'b2b.tier100' },
    { minQty: 50, rate: 0.15, labelKey: 'b2b.tier50' },
    { minQty: 25, rate: 0.1, labelKey: 'b2b.tier25' },
    { minQty: 0, rate: 0, labelKey: 'b2b.tier0' }
  ];

  shapes = signal<ShapePrice[]>([
    { id: 'mug', label: 'Mug', price: 189 },
    { id: 'coffee', label: 'Tasse & soucoupe', price: 249 },
    { id: 'espresso', label: 'Espresso', price: 159 },
    { id: 'bowl', label: 'Bol', price: 199 }
  ]);

  lines = signal<QuoteLine[]>([{ shapeId: 'mug', quantity: 25 }]);

  company = '';
  contactName = '';
  email = '';
  phone = '';
  city = '';
  message = '';

  sending = signal(false);
  sent = signal(false);
  error = signal('');

  totalQty = computed(() =>
    this.lines().reduce((sum, line) => sum + Math.max(0, Number(line.quantity) || 0), 0)
  );

  activeTier = computed(() => {
    const qty = this.totalQty();
    return this.tiers.find((t) => qty >= t.minQty) || this.tiers[this.tiers.length - 1];
  });

  subtotal = computed(() =>
    this.lines().reduce((sum, line) => {
      const shape = this.shapes().find((s) => s.id === line.shapeId);
      const qty = Math.max(0, Number(line.quantity) || 0);
      return sum + (shape?.price || 0) * qty;
    }, 0)
  );

  discountAmount = computed(() => this.subtotal() * this.activeTier().rate);

  total = computed(() => Math.max(0, this.subtotal() - this.discountAmount()));

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'B2B — Devis professionnels',
      description: 'Commandes professionnelles UNSI : simulez un devis et contactez-nous pour hôtels, cafés, entreprises et événements.',
      url: '/b2b',
      keywords: 'UNSI, B2B, devis, professionnel, entreprise, hôtel'
    });

    this.http.get<ShapePrice[]>('/api/custom-shapes').subscribe({
      next: (data) => {
        if (!Array.isArray(data) || !data.length) return;
        this.shapes.set(
          data.map((s) => ({
            id: s.id,
            label: s.label,
            price: Number(s.price) || 0
          }))
        );
      }
    });
  }

  shapeLabel(id: string): string {
    return this.shapes().find((s) => s.id === id)?.label || id;
  }

  unitPrice(id: string): number {
    return this.shapes().find((s) => s.id === id)?.price || 0;
  }

  lineTotal(line: QuoteLine): number {
    const qty = Math.max(0, Number(line.quantity) || 0);
    return this.unitPrice(line.shapeId) * qty;
  }

  addLine(): void {
    const first = this.shapes()[0];
    if (!first) return;
    this.lines.update((list) => [...list, { shapeId: first.id, quantity: 10 }]);
  }

  removeLine(index: number): void {
    this.lines.update((list) => (list.length <= 1 ? list : list.filter((_, i) => i !== index)));
  }

  updateLine(index: number, patch: Partial<QuoteLine>): void {
    this.lines.update((list) =>
      list.map((line, i) => (i === index ? { ...line, ...patch } : line))
    );
  }

  submit(): void {
    if (this.sending() || this.sent()) return;
    this.error.set('');

    if (!this.company.trim() || !this.contactName.trim() || !this.email.trim()) {
      this.error.set('b2b.errorRequired');
      return;
    }

    this.sending.set(true);
    const payload = {
      company: this.company.trim(),
      contactName: this.contactName.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      city: this.city.trim(),
      message: this.message.trim(),
      lines: this.lines().map((line) => ({
        shapeId: line.shapeId,
        label: this.shapeLabel(line.shapeId),
        quantity: Math.max(0, Number(line.quantity) || 0),
        unitPrice: this.unitPrice(line.shapeId),
        lineTotal: this.lineTotal(line)
      })),
      subtotal: this.subtotal(),
      discountRate: this.activeTier().rate,
      discountAmount: this.discountAmount(),
      total: this.total(),
      totalQty: this.totalQty()
    };

    this.http.post('/api/b2b/quotes', payload).subscribe({
      next: () => {
        this.sending.set(false);
        this.sent.set(true);
      },
      error: () => {
        this.sending.set(false);
        this.error.set('b2b.errorSend');
      }
    });
  }
}
