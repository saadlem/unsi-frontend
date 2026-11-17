import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  stock: number;
  inStock: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = '/api/products';
  private products$?: Observable<Product[]>;

  /** Clear cache after admin product CRUD. */
  invalidate(): void {
    this.products$ = undefined;
  }

  getProducts(): Observable<Product[]> {
    if (!this.products$) {
      this.products$ = this.http.get<any[]>(this.apiUrl).pipe(
        map((list) => (Array.isArray(list) ? list : []).map((p) => this.normalize(p))),
        catchError(() => of([])),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.products$;
  }

  getProductById(id: number): Observable<Product | undefined> {
    return this.getProducts().pipe(map((list) => list.find((p) => p.id === id)));
  }

  getCategories(): Observable<string[]> {
    return this.getProducts().pipe(
      map((list) => [...new Set(list.map((p) => p.category).filter(Boolean))])
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.getProducts().pipe(
      map((list) => list.filter((p) => p.category === category))
    );
  }

  searchProducts(term: string): Observable<Product[]> {
    const q = term.trim().toLowerCase();
    return this.getProducts().pipe(
      map((list) => {
        if (!q) return list;
        return list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      })
    );
  }

  private normalize(p: any): Product {
    const stock = Number(p?.stock) || 0;
    const image = p?.image || p?.image_url || '';
    return {
      id: Number(p?.id),
      name: p?.name || '',
      description: p?.description || '',
      price: Number(p?.price) || 0,
      image,
      category: p?.category || 'Table',
      rating: Number(p?.rating) || 0,
      stock,
      inStock: p?.inStock ?? stock > 0
    };
  }
}
