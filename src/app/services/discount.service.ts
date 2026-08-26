import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Discount {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order: number;
  max_uses: number;
  used_count: number;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
}

@Injectable({ providedIn: 'root' })
export class DiscountService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = '/api';

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  validate(code: string, subtotal: number) {
    return this.http.post<{ discount: { code: string; type: string; value: number; amount: number } }>(`${this.apiUrl}/discounts/validate`, { code, subtotal });
  }

  getAll(): Observable<Discount[]> {
    return this.http.get<Discount[]>(`${this.apiUrl}/admin/discounts`, { headers: this.getAuthHeaders() });
  }

  create(discount: Partial<Discount>): Observable<Discount> {
    return this.http.post<Discount>(`${this.apiUrl}/admin/discounts`, discount, { headers: this.getAuthHeaders() });
  }

  update(id: number, discount: Partial<Discount>): Observable<Discount> {
    return this.http.put<Discount>(`${this.apiUrl}/admin/discounts/${id}`, discount, { headers: this.getAuthHeaders() });
  }

  delete(id: number) {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/admin/discounts/${id}`, { headers: this.getAuthHeaders() });
  }

  sendDiscountEmail(id: number) {
    return this.http.post<{ sent: number; total: number }>(`${this.apiUrl}/admin/discounts/${id}/send`, {}, { headers: this.getAuthHeaders() });
  }
}
