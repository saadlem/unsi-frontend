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
          this.seo.updateTags({
            title: this.product.name + ' — ' + this.product.price + ' MAD',
            description: this.product.description,
            image: this.product.image,
            url: '/product/' + this.product.id,
            type: 'product'
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
