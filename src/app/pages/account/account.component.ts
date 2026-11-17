import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SeoService } from '../../services/seo.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent {
  loading = signal(false);
  error = signal('');
  loginForm = { email: '', password: '' };

  constructor(
    private http: HttpClient,
    private router: Router,
    private seo: SeoService,
    private authService: AuthService
  ) {
    this.seo.updateTags({ title: 'Administration', url: '/account' });
    if (localStorage.getItem('unsi_token')) {
      this.authService.syncFromStorage();
      this.router.navigate(['/admin']);
    }
  }

  onLogin(): void {
    this.loading.set(true);
    this.error.set('');

    this.http.post<{ token: string; admin: any }>('/api/auth/login', {
      username: this.loginForm.email.trim(),
      password: this.loginForm.password
    }).subscribe({
      next: (res) => {
        this.authService.setSession(res.token, res.admin);
        this.loading.set(false);
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Identifiants incorrects');
        this.loading.set(false);
      }
    });
  }
}
