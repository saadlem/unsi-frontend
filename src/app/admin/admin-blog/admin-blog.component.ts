import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { BLOG_CATEGORIES, BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-admin-blog',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admin-blog.component.html',
  styleUrl: './admin-blog.component.css'
})
export class AdminBlogComponent implements OnInit {
  private api = inject(ApiService);
  private blog = inject(BlogService);

  posts: any[] = [];
  categories = [...BLOG_CATEGORIES];
  showModal = false;
  editingPost: any = null;
  searchTerm = '';
  filterCategory = 'all';
  uploading = false;
  saving = false;

  form: any = this.emptyForm();

  ngOnInit(): void {
    this.loadPosts();
  }

  emptyForm() {
    return {
      title: '',
      slug: '',
      excerpt: '',
      contentText: '',
      cover: '',
      category: 'Quotidien',
      date: new Date().toISOString().slice(0, 10),
      readMinutes: 8,
      featured: false
    };
  }

  loadPosts(): void {
    this.blog.invalidate();
    this.api.adminGetBlogPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        const extras = posts
          .map((p: any) => p.category)
          .filter((c: string) => c && !this.categories.includes(c as any));
        this.categories = [...new Set([...BLOG_CATEGORIES, ...extras])];
      },
      error: () => {
        this.posts = [];
      }
    });
  }

  get filteredPosts(): any[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.posts.filter((p) => {
      const matchCat = this.filterCategory === 'all' || p.category === this.filterCategory;
      const matchTerm =
        !term ||
        p.title?.toLowerCase().includes(term) ||
        p.slug?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term);
      return matchCat && matchTerm;
    });
  }

  slugify(text: string): string {
    return String(text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  onTitleChange(): void {
    if (!this.editingPost || !this.form.slug) {
      this.form.slug = this.slugify(this.form.title);
    }
  }

  openAddModal(): void {
    this.editingPost = null;
    this.form = this.emptyForm();
    this.showModal = true;
  }

  openEditModal(post: any): void {
    this.editingPost = post;
    this.form = {
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      contentText: Array.isArray(post.content) ? post.content.join('\n\n') : String(post.content || ''),
      cover: post.cover || '',
      category: post.category || 'Quotidien',
      date: post.date || new Date().toISOString().slice(0, 10),
      readMinutes: post.readMinutes || 5,
      featured: !!post.featured
    };
    this.showModal = true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploading = true;
    this.api.uploadImage(input.files[0]).subscribe({
      next: (res) => {
        this.form.cover = res.url;
        this.uploading = false;
      },
      error: () => {
        this.uploading = false;
        alert('Erreur lors de l\'upload');
      }
    });
  }

  payloadFromForm() {
    return {
      title: this.form.title,
      slug: this.form.slug || this.slugify(this.form.title),
      excerpt: this.form.excerpt,
      content: this.form.contentText,
      cover: this.form.cover,
      category: this.form.category,
      date: this.form.date,
      readMinutes: Number(this.form.readMinutes) || 0,
      featured: !!this.form.featured
    };
  }

  save(): void {
    if (!this.form.title?.trim()) {
      alert('Le titre est requis');
      return;
    }
    if (!this.form.contentText?.trim()) {
      alert('Le contenu est requis');
      return;
    }

    this.saving = true;
    const payload = this.payloadFromForm();
    const req$ = this.editingPost
      ? this.api.adminUpdateBlogPost(this.editingPost.id, payload)
      : this.api.adminCreateBlogPost(payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.loadPosts();
      },
      error: (err) => {
        this.saving = false;
        alert(err?.error?.error || 'Erreur lors de l\'enregistrement');
      }
    });
  }

  deletePost(post: any): void {
    if (!confirm(`Supprimer l'article « ${post.title} » ?`)) return;
    this.api.adminDeleteBlogPost(post.id).subscribe({
      next: () => this.loadPosts(),
      error: () => alert('Erreur lors de la suppression')
    });
  }

  toggleFeatured(post: any): void {
    const next = !post.featured;
    this.api
      .adminUpdateBlogPost(post.id, {
        ...post,
        content: post.content,
        featured: next
      })
      .subscribe({
        next: () => this.loadPosts(),
        error: () => alert('Impossible de mettre à jour')
      });
  }

  get featuredPost(): any | null {
    return this.posts.find((p) => p.featured) || null;
  }
}
