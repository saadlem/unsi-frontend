import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';

export interface SitePage {
  id?: number;
  slug: string;
  label: string;
  path: string;
  enabled: boolean;
  showInNav: boolean;
  showInFooter: boolean;
  sortOrder: number;
}

@Injectable({
  providedIn: 'root'
})
export class PagesService {
  private http = inject(HttpClient);
  private loaded = signal(false);
  private pagesSignal = signal<SitePage[]>([]);

  readonly pages = this.pagesSignal.asReadonly();
  readonly ready = this.loaded.asReadonly();

  readonly navPages = computed(() =>
    this.pagesSignal()
      .filter((p) => p.enabled && p.showInNav)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  );

  readonly footerPages = computed(() =>
    this.pagesSignal()
      .filter((p) => p.enabled && p.showInFooter)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  );

  load(): Observable<SitePage[]> {
    return this.http.get<SitePage[]>('/api/pages').pipe(
      tap((pages) => {
        this.pagesSignal.set(Array.isArray(pages) ? pages : []);
        this.loaded.set(true);
      }),
      catchError(() => {
        this.pagesSignal.set([]);
        this.loaded.set(true);
        return of([]);
      })
    );
  }

  ensureLoaded(): Observable<SitePage[]> {
    if (this.loaded()) return of(this.pagesSignal());
    return this.load();
  }

  isEnabled(slugOrPath: string): boolean {
    const pages = this.pagesSignal();
    if (!pages.length) return true; // fail-open until loaded / if API missing
    const key = slugOrPath.replace(/^\//, '');
    const page = pages.find(
      (p) => p.slug === key || p.path === slugOrPath || p.path === `/${key}`
    );
    if (!page) return true;
    return !!page.enabled;
  }

  adminList(): Observable<SitePage[]> {
    return this.http.get<SitePage[]>('/api/admin/pages');
  }

  adminSave(pages: SitePage[]): Observable<SitePage[]> {
    return this.http.put<SitePage[]>('/api/admin/pages', pages).pipe(
      tap((saved) => {
        this.pagesSignal.set(Array.isArray(saved) ? saved : pages);
        this.loaded.set(true);
      })
    );
  }
}
