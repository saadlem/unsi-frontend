import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PagesService, SitePage } from '../../services/pages.service';

@Component({
  selector: 'app-admin-pages',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-pages.component.html',
  styleUrl: './admin-pages.component.css'
})
export class AdminPagesComponent implements OnInit {
  private pagesService = inject(PagesService);

  pages: SitePage[] = [];
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
    // Public read endpoint — works even if admin JWT is stale
    this.pagesService.load().subscribe({
      next: (data) => {
        this.pages = (data || []).map((p) => ({ ...p }));
        this.loading = false;
        if (!this.pages.length) {
          this.error = 'Aucune page configurée côté serveur.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger les pages.';
      }
    });
  }

  save(): void {
    this.saving = true;
    this.saved = false;
    this.error = '';
    this.pagesService.adminSave(this.pages).subscribe({
      next: (data) => {
        this.pages = (data || []).map((p) => ({ ...p }));
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

  toggle(page: SitePage, key: 'enabled' | 'showInNav' | 'showInFooter'): void {
    page[key] = !page[key];
    if (!page.enabled) {
      page.showInNav = false;
      page.showInFooter = false;
    }
  }
}
