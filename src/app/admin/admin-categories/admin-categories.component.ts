import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.css'
})
export class AdminCategoriesComponent implements OnInit {
  private api = inject(ApiService);
  categories: any[] = [];
  showModal = false;
  editingCategory: any = null;
  uploading = false;

  form: any = { name: '', description: '', image: '', sort_order: 0 };

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.api.adminGetCategories().subscribe(c => this.categories = c);
  }

  openAddModal(): void {
    this.editingCategory = null;
    this.form = { name: '', description: '', image: '', sort_order: this.categories.length };
    this.showModal = true;
  }

  openEditModal(cat: any): void {
    this.editingCategory = cat;
    this.form = { ...cat };
    this.showModal = true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploading = true;
    this.api.uploadImage(input.files[0]).subscribe({
      next: (res) => { this.form.image = res.url; this.uploading = false; },
      error: () => { this.uploading = false; alert('Erreur lors de l\'upload'); }
    });
  }

  save(): void {
    if (this.editingCategory) {
      this.api.adminUpdateCategory(this.editingCategory.id, this.form).subscribe(() => {
        this.showModal = false;
        this.loadCategories();
      });
    } else {
      this.api.adminCreateCategory(this.form).subscribe(() => {
        this.showModal = false;
        this.loadCategories();
      });
    }
  }

  deleteCategory(cat: any): void {
    if (cat.product_count > 0) {
      alert(`Impossible de supprimer "${cat.name}" — ${cat.product_count} produit(s) lui sont associés.`);
      return;
    }
    if (confirm(`Supprimer la catégorie "${cat.name}" ?`)) {
      this.api.adminDeleteCategory(cat.id).subscribe(() => this.loadCategories());
    }
  }
}
