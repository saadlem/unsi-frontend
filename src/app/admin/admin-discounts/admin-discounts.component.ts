import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { DiscountService, Discount } from '../../services/discount.service';

@Component({
  selector: 'app-admin-discounts',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe],
  templateUrl: './admin-discounts.component.html',
  styleUrl: './admin-discounts.component.css'
})
export class AdminDiscountsComponent implements OnInit {
  private discountService = inject(DiscountService);

  discounts = signal<Discount[]>([]);
  showForm = signal(false);
  editingDiscount = signal<Discount | null>(null);
  sending = signal<number | null>(null);

  form = {
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    min_order: 0,
    max_uses: 0,
    start_date: '',
    end_date: ''
  };

  ngOnInit() {
    this.load();
  }

  load() {
    this.discountService.getAll().subscribe(d => this.discounts.set(d));
  }

  openNew() {
    this.editingDiscount.set(null);
    this.form = { code: '', type: 'percentage', value: 0, min_order: 0, max_uses: 0, start_date: '', end_date: '' };
    this.showForm.set(true);
  }

  edit(d: Discount) {
    this.editingDiscount.set(d);
    this.form = {
      code: d.code,
      type: d.type,
      value: d.value,
      min_order: d.min_order,
      max_uses: d.max_uses,
      start_date: d.start_date ? d.start_date.slice(0, 10) : '',
      end_date: d.end_date ? d.end_date.slice(0, 10) : ''
    };
    this.showForm.set(true);
  }

  save() {
    const payload = {
      ...this.form,
      code: this.form.code.toUpperCase(),
      start_date: this.form.start_date || null,
      end_date: this.form.end_date || null
    };

    const obs = this.editingDiscount()
      ? this.discountService.update(this.editingDiscount()!.id, payload)
      : this.discountService.create(payload);

    obs.subscribe(() => {
      this.showForm.set(false);
      this.load();
    });
  }

  toggle(d: Discount) {
    this.discountService.update(d.id, { active: !d.active } as any).subscribe(() => this.load());
  }

  deleteDiscount(d: Discount) {
    if (confirm(`Supprimer le code "${d.code}" ?`)) {
      this.discountService.delete(d.id).subscribe(() => this.load());
    }
  }

  sendEmail(d: Discount) {
    this.sending.set(d.id);
    this.discountService.sendDiscountEmail(d.id).subscribe({
      next: (res) => {
        alert(`Email envoyé à ${res.sent} abonnés`);
        this.sending.set(null);
      },
      error: () => {
        alert('Erreur lors de l\'envoi');
        this.sending.set(null);
      }
    });
  }
}
