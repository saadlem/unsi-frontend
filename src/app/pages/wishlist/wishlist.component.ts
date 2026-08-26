import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { WishlistService } from '../../services/wishlist.service';
import { ProductService, Product } from '../../services/product.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, TranslatePipe],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  private wishlistService = inject(WishlistService);
  private productService = inject(ProductService);
  private seo = inject(SeoService);
  products = signal<Product[]>([]);

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'Mes Favoris',
      url: '/wishlist'
    });
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe(all => {
      const ids = this.wishlistService.items();
      this.products.set(all.filter(p => ids.includes(p.id)));
    });
  }
}
