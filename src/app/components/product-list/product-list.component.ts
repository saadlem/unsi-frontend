import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, TranslatePipe],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private seo = inject(SeoService);
  products: Product[] = [];
  categories: string[] = ['All'];
  selectedCategory = 'All';
  searchTerm = '';

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'Nos Créations',
      description: 'Découvrez les objets UNSI pour un quotidien plus chaleureux.',
      url: '/products'
    });
    this.loadProducts();
    this.productService.getCategories().subscribe(c => this.categories = ['All', ...c]);
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  private applyFilters(): void {
    if (this.searchTerm) {
      this.productService.searchProducts(this.searchTerm).subscribe(p => this.products = p);
    } else if (this.selectedCategory !== 'All') {
      this.productService.getProductsByCategory(this.selectedCategory).subscribe(p => this.products = p);
    } else {
      this.loadProducts();
    }
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe(p => this.products = p);
  }
}
