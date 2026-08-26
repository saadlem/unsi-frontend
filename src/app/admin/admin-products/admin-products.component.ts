import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, SlicePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [FormsModule, DecimalPipe, SlicePipe],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css'
})
export class AdminProductsComponent implements OnInit {
  private api = inject(ApiService);
  products: any[] = [];
  categories: any[] = [];
  showModal = false;
  editingProduct: any = null;
  searchTerm = '';
  uploading = false;

  form: any = {
    name: '', description: '', price: 0, image: '', category: 'Céramique', rating: 0, stock: 0
  };

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.api.adminGetProducts().subscribe(p => this.products = p);
  }

  loadCategories(): void {
    this.api.adminGetCategories().subscribe(c => this.categories = c);
  }

  get filteredProducts(): any[] {
    if (!this.searchTerm) return this.products;
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(p => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term));
  }

  openAddModal(): void {
    this.editingProduct = null;
    this.form = { name: '', description: '', price: 0, image: '', category: 'Céramique', rating: 0, stock: 0 };
    this.showModal = true;
  }

  openEditModal(product: any): void {
    this.editingProduct = product;
    this.form = { ...product };
    this.showModal = true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploading = true;
    this.api.uploadImage(file).subscribe({
      next: (res) => {
        this.form.image = res.url;
        this.uploading = false;
      },
      error: () => {
        this.uploading = false;
        alert('Erreur lors de l\'upload');
      }
    });
  }

  save(): void {
    if (this.editingProduct) {
      this.api.adminUpdateProduct(this.editingProduct.id, this.form).subscribe(() => {
        this.showModal = false;
        this.loadProducts();
      });
    } else {
      this.api.adminCreateProduct(this.form).subscribe(() => {
        this.showModal = false;
        this.loadProducts();
      });
    }
  }

  updateStock(product: any, stock: number): void {
    this.api.adminUpdateStock(product.id, stock).subscribe(() => this.loadProducts());
  }

  deleteProduct(product: any): void {
    if (confirm(`Supprimer "${product.name}" ?`)) {
      this.api.adminDeleteProduct(product.id).subscribe(() => this.loadProducts());
    }
  }
}
