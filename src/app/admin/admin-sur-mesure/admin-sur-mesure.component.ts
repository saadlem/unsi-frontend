import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface CustomShapePrice {
  id: string;
  label: string;
  price: number;
}

@Component({
  selector: 'app-admin-sur-mesure',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-sur-mesure.component.html',
  styleUrl: './admin-sur-mesure.component.css'
})
export class AdminSurMesureComponent implements OnInit {
  private http = inject(HttpClient);

  shapes: CustomShapePrice[] = [];
  loading = true;
  saving = false;
  saved = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    // Public endpoint — avoids 401 when admin JWT is stale
    this.http.get<CustomShapePrice[]>('/api/custom-shapes').subscribe({
      next: (data) => {
        this.shapes = (data || []).map((s) => ({
          id: s.id,
          label: s.label,
          price: Number(s.price) || 0
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger les prix Sur mesure.';
      }
    });
  }

  save(): void {
    this.saving = true;
    this.saved = false;
    this.error = '';
    const payload = this.shapes.map((s) => ({
      id: s.id,
      label: s.label,
      price: Math.max(0, Number(s.price) || 0)
    }));
    this.http.put<CustomShapePrice[]>('/api/admin/custom-shapes', payload).subscribe({
      next: (data) => {
        this.shapes = (data || []).map((s) => ({
          id: s.id,
          label: s.label,
          price: Number(s.price) || 0
        }));
        this.saving = false;
        this.saved = true;
        setTimeout(() => (this.saved = false), 3000);
      },
      error: (err) => {
        this.saving = false;
        if (err?.status === 401) {
          this.error = 'Session expirée. Reconnectez-vous, puis réessayez.';
        } else {
          this.error = 'Enregistrement impossible.';
        }
      }
    });
  }
}
