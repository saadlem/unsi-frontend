import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private seo = inject(SeoService);
  cartService = inject(CartService);

  product: Product | undefined;
  quantity = 1;
  added = false;
  loading = true;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProductById(id).subscribe({
      next: (p) => {
        this.product = p as any;
        this.loading = false;
        if (this.product) {
          const p = this.product;
          this.seo.updateTags({
            title: `${p.name} — ${p.price} MAD`,
            description: p.description,
            image: p.image,
            url: `/product/${p.id}`,
            type: 'product',
            keywords: `${p.name}, ${p.category}, UNSI, Maroc`,
            jsonLd: {
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: p.name,
              description: p.description,
              image: p.image?.startsWith('http') ? p.image : `https://unsi.ma/${p.image}`,
              sku: String(p.id),
              brand: { '@type': 'Brand', name: 'UNSI' },
              category: p.category,
              offers: {
                '@type': 'Offer',
                url: `https://unsi.ma/product/${p.id}`,
                priceCurrency: 'MAD',
                price: p.price,
                availability: p.inStock
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
                itemCondition: 'https://schema.org/NewCondition'
              },
              aggregateRating: p.rating
                ? {
                    '@type': 'AggregateRating',
                    ratingValue: p.rating,
                    reviewCount: 1
                  }
                : undefined
            }
          });
        }
      },
      error: () => this.loading = false
    });
  }

  increaseQty(): void {
    this.quantity++;
  }

  decreaseQty(): void {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart(): void {
    if (!this.product) return;
    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(this.product);
    }
    this.added = true;
    setTimeout(() => this.added = false, 2000);
  }
}
