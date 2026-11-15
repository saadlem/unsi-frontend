import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductCardComponent, TranslatePipe, RevealDirective],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private seo = inject(SeoService);

  private allProducts = signal<Product[]>([]);
  categories = signal<string[]>(['All']);
  selectedCategory = signal('All');
  searchTerm = signal('');
  loaded = signal(false);

  products = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    const cat = this.selectedCategory();
    return this.allProducts().filter((p) => {
      const matchCat = cat === 'All' || p.category === cat;
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  });

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.location.pathname.includes('/products')) {
      this.seo.updateTags({
        title: 'Nos Créations',
        description: 'Découvrez les objets UNSI pour un quotidien plus chaleureux — céramique, table, déco.',
        url: '/products',
        keywords: 'créations UNSI, céramique, déco maison, Maroc',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Nos Créations — UNSI',
          url: 'https://unsi.ma/products',
          description: 'Objets UNSI pour un quotidien plus chaleureux.'
        }
      });
    }

    this.productService.getProducts().subscribe((list) => {
      this.allProducts.set(list);
      this.categories.set(['All', ...new Set(list.map((p) => p.category).filter(Boolean))]);
      this.loaded.set(true);
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }
}
