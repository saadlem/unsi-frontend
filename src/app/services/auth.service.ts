import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';

export interface Admin {
  id: string;
  username: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/auth';
  private currentAdmin = signal<Admin | null>(null);

  admin = this.currentAdmin.asReadonly();
  isLoggedIn = computed(() => !!this.currentAdmin());

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('unsi_token');
    const admin = localStorage.getItem('unsi_admin');
    if (token && admin) {
      try {
        this.currentAdmin.set(JSON.parse(admin));
      } catch {
        this.currentAdmin.set(null);
      }
    } else {
      this.currentAdmin.set(null);
    }
  }

  syncFromStorage(): void {
    this.loadFromStorage();
  }

  setSession(token: string, admin: Admin): void {
    localStorage.setItem('unsi_token', token);
    localStorage.setItem('unsi_admin', JSON.stringify(admin));
    this.currentAdmin.set(admin);
  }

  login(username: string, password: string) {
    return this.http.post<{ token: string; admin: Admin }>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem('unsi_token', res.token);
        localStorage.setItem('unsi_admin', JSON.stringify(res.admin));
        this.currentAdmin.set(res.admin);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('unsi_token');
    localStorage.removeItem('unsi_admin');
    this.currentAdmin.set(null);
    this.router.navigate(['/account']);
  }

  getToken(): string | null {
    return localStorage.getItem('unsi_token');
  }

  checkAuth() {
    return this.http.get<{ admin: Admin }>(`${this.apiUrl}/me`).pipe(
      tap(res => this.currentAdmin.set(res.admin)),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }
}
