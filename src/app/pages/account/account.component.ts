import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SeoService } from '../../services/seo.service';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip_code: string;
  subtotal: number;
  discount_amount: number;
  discount_code: string | null;
  total: number;
  status: string;
  notes: string | null;
  created_at: string;
  items?: any[];
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent {
  mode = signal<'login' | 'register' | 'profile'>('login');
  customer = signal<Customer | null>(null);
  orders = signal<Order[]>([]);
  loading = signal(false);
  error = signal('');

  loginForm = { email: '', password: '' };
  registerForm = { name: '', email: '', password: '', confirmPassword: '' };
  profileForm = { name: '', email: '', phone: '' };

  constructor(private http: HttpClient, private router: Router, private seo: SeoService) {
    this.seo.updateTags({ title: 'Mon Compte', url: '/account' });
    this.checkAuth();
  }

  private checkAuth(): void {
    // Admin already logged in → redirect to admin
    if (localStorage.getItem('unsi_token')) {
      this.router.navigate(['/admin']);
      return;
    }
    // Customer logged in → redirect to products
    const token = localStorage.getItem('unsi_customer_token');
    if (!token) return;
    this.http.get<Customer>('/api/customers/me').subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: () => {
        localStorage.removeItem('unsi_customer_token');
      }
    });
  }

  private loadOrders(): void {
    this.http.get<Order[]>('/api/customers/orders').subscribe({
      next: (orders) => this.orders.set(orders),
      error: () => {}
    });
  }

  toggleMode(): void {
    this.error.set('');
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
  }

  onLogin(): void {
    this.loading.set(true);
    this.error.set('');

    // Try admin login first
    this.http.post<{ token: string; admin: any }>('/api/auth/login', {
      username: this.loginForm.email,
      password: this.loginForm.password
    }).subscribe({
      next: (res) => {
        localStorage.setItem('unsi_token', res.token);
        localStorage.setItem('unsi_admin', JSON.stringify(res.admin));
        this.router.navigate(['/admin']);
      },
      error: () => {
        // Not an admin → try customer login
        this.http.post<{ token: string; customer: Customer }>('/api/customers/login', this.loginForm).subscribe({
          next: (res) => {
            localStorage.setItem('unsi_customer_token', res.token);
            this.router.navigate(['/products']);
          },
          error: (err) => {
            this.error.set(err.error?.error || 'Email ou mot de passe incorrect');
            this.loading.set(false);
          }
        });
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.error.set('Les mots de passe ne correspondent pas');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.http.post<{ token: string; customer: Customer }>('/api/customers/register', {
      name: this.registerForm.name,
      email: this.registerForm.email,
      password: this.registerForm.password
    }).subscribe({
      next: (res) => {
        localStorage.setItem('unsi_customer_token', res.token);
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.error.set(err.error?.error || "Erreur d'inscription");
        this.loading.set(false);
      }
    });
  }

  onUpdateProfile(): void {
    this.loading.set(true);
    this.error.set('');
    this.http.put<Customer>('/api/customers/me', this.profileForm).subscribe({
      next: (c) => {
        this.customer.set(c);
        this.loading.set(false);
        this.error.set('');
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Erreur de mise à jour');
        this.loading.set(false);
      }
    });
  }

  logout(): void {
    localStorage.removeItem('unsi_customer_token');
    localStorage.removeItem('unsi_token');
    localStorage.removeItem('unsi_admin');
    this.customer.set(null);
    this.orders.set([]);
    this.mode.set('login');
    this.loginForm = { email: '', password: '' };
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
