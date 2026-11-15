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

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Mug blush',
    description: 'Mug en céramique rose doux pour les matins lents et les cafés partagés.',
    price: 129,
    category: 'Table',
    stock: 24,
    image: 'assets/products/mug.jpg',
    rating: 4.9,
    inStock: true
  },
  {
    id: 2,
    name: 'Bol céramique crème',
    description: 'Bol artisanal à bord rose, parfait pour un petit-déjeuner plus chaleureux.',
    price: 159,
    category: 'Table',
    stock: 18,
    image: 'assets/products/bowl.jpg',
    rating: 4.8,
    inStock: true
  },
  {
    id: 3,
    name: 'Vase solitaire',
    description: 'Petit vase en grès rose pour une fleur, ou simplement pour la beauté du geste.',
    price: 189,
    category: 'Déco',
    stock: 14,
    image: 'assets/products/vase.jpg',
    rating: 4.7,
    inStock: true
  },
  {
    id: 4,
    name: 'Bougie céramique',
    description: 'Bougie soja dans un pot céramique blush, à réutiliser ensuite comme joli objet.',
    price: 149,
    category: 'Ambiance',
    stock: 30,
    image: 'assets/products/candle.jpg',
    rating: 4.9,
    inStock: true
  },
  {
    id: 5,
    name: 'Assiettes duo',
    description: 'Deux assiettes crème et rose pour célébrer la table du quotidien.',
    price: 249,
    category: 'Table',
    stock: 12,
    image: 'assets/products/plates.jpg',
    rating: 4.8,
    inStock: true
  },
  {
    id: 6,
    name: 'Plaid lin blush',
    description: 'Plaid en lin doux, à poser sur le canapé ou le lit pour un coin plus personnel.',
    price: 329,
    category: 'Textile',
    stock: 9,
    image: 'assets/products/throw.jpg',
    rating: 4.6,
    inStock: true
  },
  {
    id: 7,
    name: 'Plateau céramique',
    description: 'Plateau ovale pour le café du matin ou l’apéritif improvisé.',
    price: 219,
    category: 'Table',
    stock: 16,
    image: 'assets/products/tray.jpg',
    rating: 4.7,
    inStock: true
  },
  {
    id: 8,
    name: 'Pichet rose',
    description: 'Pichet tout en douceur pour l’eau, le jus ou les fleurs coupées.',
    price: 199,
    category: 'Cuisine',
    stock: 11,
    image: 'assets/products/pitcher.jpg',
    rating: 4.8,
    inStock: true
  },
  {
    id: 9,
    name: 'Tasse espresso',
    description: 'Petite tasse pour le café serré, le moment court et précieux.',
    price: 89,
    category: 'Table',
    stock: 40,
    image: 'assets/products/espresso.jpg',
    rating: 4.9,
    inStock: true
  },
  {
    id: 10,
    name: 'Bocal hermétique',
    description: 'Bocal en verre et céramique pour ranger avec style.',
    price: 139,
    category: 'Cuisine',
    stock: 22,
    image: 'assets/products/jar.jpg',
    rating: 4.5,
    inStock: true
  },
  {
    id: 11,
    name: 'Mug nuage',
    description: 'Grand mug crémeux pour le thé du soir et les pauses douces.',
    price: 129,
    category: 'Table',
    stock: 20,
    image: 'assets/products/mug.jpg',
    rating: 4.8,
    inStock: true
  },
  {
    id: 12,
    name: 'Bougie soir',
    description: 'Parfum doux pour accompagner la lumière basse du soir.',
    price: 149,
    category: 'Ambiance',
    stock: 25,
    image: 'assets/products/candle.jpg',
    rating: 4.8,
    inStock: true
  }
];

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
        map((list) => list.map((p) => this.normalize(p))),
        catchError(() => of(MOCK_PRODUCTS)),
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
