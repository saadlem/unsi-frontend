import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

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
    name: 'Plateau service',
    description: 'Plateau bois clair avec tasses céramique pour les pauses thé improvisées.',
    price: 279,
    category: 'Table',
    stock: 11,
    image: 'assets/products/tray.jpg',
    rating: 4.7,
    inStock: true
  },
  {
    id: 8,
    name: 'Pichet rose',
    description: 'Pichet céramique pour l’eau, le jus ou simplement comme pièce déco.',
    price: 219,
    category: 'Table',
    stock: 10,
    image: 'assets/products/pitcher.jpg',
    rating: 4.8,
    inStock: true
  },
  {
    id: 9,
    name: 'Tasse espresso & soucoupe',
    description: 'Duo espresso blush pour les moments courts mais précieux.',
    price: 119,
    category: 'Table',
    stock: 22,
    image: 'assets/products/espresso.jpg',
    rating: 4.9,
    inStock: true
  },
  {
    id: 10,
    name: 'Bocal cuisine',
    description: 'Bocal céramique à couvercle pour le sucre, le café, ou ce que vous aimez.',
    price: 169,
    category: 'Cuisine',
    stock: 16,
    image: 'assets/products/jar.jpg',
    rating: 4.7,
    inStock: true
  },
  {
    id: 11,
    name: 'Mug édition limitée',
    description: 'Petite série du mug blush — stock volontairement limité.',
    price: 139,
    category: 'Table',
    stock: 4,
    image: 'assets/products/mug.jpg',
    rating: 5,
    inStock: true
  },
  {
    id: 12,
    name: 'Vase & bougie duo',
    description: 'Ambiance douce : vase solitaire et bougie céramique pour un coin plus vivant.',
    price: 299,
    category: 'Ambiance',
    stock: 7,
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

  getProducts(): Observable<Product[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((list) => list.map((p) => this.normalize(p))),
      catchError(() => of(MOCK_PRODUCTS))
    );
  }

  getProductById(id: number): Observable<Product | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((p) => this.normalize(p)),
      catchError(() => of(MOCK_PRODUCTS.find((p) => p.id === id)))
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`).pipe(
      catchError(() => of([...new Set(MOCK_PRODUCTS.map((p) => p.category))]))
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<any[]>(this.apiUrl, { params: { category } }).pipe(
      map((list) => list.map((p) => this.normalize(p))),
      catchError(() => of(MOCK_PRODUCTS.filter((p) => p.category === category)))
    );
  }

  searchProducts(term: string): Observable<Product[]> {
    return this.http.get<any[]>(this.apiUrl, { params: { search: term } }).pipe(
      map((list) => list.map((p) => this.normalize(p))),
      catchError(() => {
        const q = term.toLowerCase();
        return of(
          MOCK_PRODUCTS.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q)
          )
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
