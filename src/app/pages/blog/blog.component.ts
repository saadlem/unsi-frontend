import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BlogCategoryGroup, BlogPost, BlogService } from '../../services/blog.service';
import { SeoService } from '../../services/seo.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink, DatePipe, TranslatePipe, RevealDirective],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent implements OnInit {
  private blog = inject(BlogService);
  private seo = inject(SeoService);

  posts = signal<BlogPost[]>([]);
  categories = signal<string[]>([]);
  featured = signal<BlogPost | null>(null);
  activeCategory = signal<string | null>(null);
  loaded = signal(false);

  filteredPosts = computed(() => {
    const cat = this.activeCategory();
    const all = this.posts();
    if (!cat) return all;
    return all.filter((p) => p.category === cat);
  });

  groups = computed<BlogCategoryGroup[]>(() => {
    if (this.activeCategory()) return [];
    const cats = this.categories();
    const all = this.posts();
    const heroSlug = this.featured()?.slug;
    return cats
      .map((category) => ({
        category,
        posts: all.filter((p) => p.category === category && p.slug !== heroSlug)
      }))
      .filter((g) => g.posts.length > 0);
  });

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'Journal UNSI',
      description: 'Le journal UNSI — articles longs sur le quotidien, la table, la déco et la maison.',
      url: '/blog',
      keywords: 'journal UNSI, blog déco, maison, Maroc',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Journal UNSI',
        url: 'https://unsi.ma/blog',
        description: 'Articles longs sur le quotidien, la table, la déco et la maison.',
        publisher: { '@type': 'Organization', name: 'UNSI' }
      }
    });

    // One request only — categories are derived locally
    this.blog.getPosts().subscribe((posts) => {
      this.posts.set(posts);
      this.featured.set(posts.find((p) => p.featured) || posts[0] || null);
      const present = [...new Set(posts.map((p) => p.category).filter(Boolean))];
      this.categories.set([
        ...this.blog.categories.filter((c) => present.includes(c)),
        ...present.filter((c) => !this.blog.categories.includes(c as any))
      ]);
      this.loaded.set(true);
    });
  }

  setCategory(category: string | null): void {
    this.activeCategory.set(category);
  }

  isActive(category: string | null): boolean {
    return this.activeCategory() === category;
  }
}
