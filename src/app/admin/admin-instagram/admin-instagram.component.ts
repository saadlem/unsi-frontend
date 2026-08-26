import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface InstagramPost {
  id: number;
  image_url: string;
  link: string;
  caption: string;
  sort_order: number;
  active: number;
  created_at: string;
}

@Component({
  selector: 'app-admin-instagram',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-instagram.component.html',
  styleUrl: './admin-instagram.component.css'
})
export class AdminInstagramComponent implements OnInit {
  private http = inject(HttpClient);
  posts: InstagramPost[] = [];
  loading = true;
  showModal = false;
  editingPost: Partial<InstagramPost> | null = null;
  imagePreview = '';
  saving = false;

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.http.get<InstagramPost[]>('/api/admin/instagram-posts').subscribe({
      next: (data) => { this.posts = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openAdd(): void {
    this.editingPost = { image_url: '', link: '', caption: '', sort_order: 0, active: 1 };
    this.imagePreview = '';
    this.showModal = true;
  }

  openEdit(post: InstagramPost): void {
    this.editingPost = { ...post };
    this.imagePreview = post.image_url;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingPost = null;
    this.imagePreview = '';
  }

  onImageInput(): void {
    this.imagePreview = this.editingPost?.image_url || '';
  }

  save(): void {
    if (!this.editingPost?.image_url) return;
    this.saving = true;
    if (this.editingPost.id) {
      this.http.put(`/api/admin/instagram-posts/${this.editingPost.id}`, this.editingPost).subscribe({
        next: () => { this.closeModal(); this.loadPosts(); this.saving = false; },
        error: () => this.saving = false
      });
    } else {
      this.http.post('/api/admin/instagram-posts', this.editingPost).subscribe({
        next: () => { this.closeModal(); this.loadPosts(); this.saving = false; },
        error: () => this.saving = false
      });
    }
  }

  toggleActive(post: InstagramPost): void {
    this.http.put(`/api/admin/instagram-posts/${post.id}`, { active: post.active ? 0 : 1 }).subscribe({
      next: () => this.loadPosts()
    });
  }

  deletePost(post: InstagramPost): void {
    if (!confirm('Supprimer ce post ?')) return;
    this.http.delete(`/api/admin/instagram-posts/${post.id}`).subscribe({
      next: () => this.loadPosts()
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const formData = new FormData();
    formData.append('image', input.files[0]);
    this.http.post<{ url: string }>('/api/admin/upload', formData).subscribe({
      next: (res) => { if (this.editingPost) { this.editingPost.image_url = res.url; this.imagePreview = res.url; } }
    });
  }
}
