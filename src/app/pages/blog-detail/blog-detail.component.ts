import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BlogPost, BlogService } from '../../services/blog.service';
import { SeoService } from '../../services/seo.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, TranslatePipe, RevealDirective],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.css'
})
export class BlogDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private blog = inject(BlogService);
  private seo = inject(SeoService);

  post = signal<BlogPost | null>(null);
  related = signal<BlogPost[]>([]);
  missing = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') || '';
      // Single cached fetch — post + related derived locally
      this.blog.getPosts().subscribe((posts) => {
        const post = posts.find((p) => p.slug === slug);
        if (!post) {
          this.missing.set(true);
          this.post.set(null);
          this.related.set([]);
          return;
        }
        this.missing.set(false);
        this.post.set(post);
        this.seo.updateTags({
          title: post.title,
          description: post.excerpt,
          url: `/blog/${post.slug}`,
          image: post.cover,
          type: 'article',
          keywords: `${post.category}, UNSI, journal, ${post.title}`,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            image: post.cover?.startsWith('http') ? post.cover : `https://unsi.ma/${post.cover}`,
            datePublished: post.date,
            dateModified: post.date,
            author: { '@type': 'Organization', name: 'UNSI' },
            publisher: {
              '@type': 'Organization',
              name: 'UNSI',
              logo: {
                '@type': 'ImageObject',
                url: 'https://unsi.ma/assets/brand/unsi-logo.png'
              }
            },
            mainEntityOfPage: `https://unsi.ma/blog/${post.slug}`,
            articleSection: post.category
          }
        });
        const same = posts.filter((p) => p.slug !== slug && p.category === post.category);
        const others = posts.filter((p) => p.slug !== slug && p.category !== post.category);
        this.related.set([...same, ...others].slice(0, 3));
      });
    });
  }
}
