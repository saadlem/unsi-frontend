import { Injectable, inject, RendererFactory2 } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

const SITE_URL = 'https://unsi.ma';
const SITE_NAME = 'UNSI';
const DEFAULT_IMAGE = `${SITE_URL}/assets/brand/unsi-logo.png`;

export interface SeoConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);
  private renderer = inject(RendererFactory2).createRenderer(null, null);

  updateTags(config: SeoConfig): void {
    const path = config.url || '/';
    const absoluteUrl = path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const image = this.toAbsoluteImage(config.image || DEFAULT_IMAGE);
    const pageTitle = config.title
      ? (config.title.includes(SITE_NAME) ? config.title : `${config.title} — ${SITE_NAME}`)
      : SITE_NAME;

    if (config.title) {
      this.title.setTitle(pageTitle);
      this.meta.updateTag({ property: 'og:title', content: pageTitle });
      this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    }

    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
      this.meta.updateTag({ name: 'twitter:description', content: config.description });
    }

    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    this.meta.updateTag({ property: 'og:url', content: absoluteUrl });
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:locale', content: 'fr_FR' });

    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    this.setCanonical(absoluteUrl);

    if (config.jsonLd) {
      this.setJsonLd(config.jsonLd);
    }
  }

  setOrganizationSchema(): void {
    this.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/assets/brand/unsi-logo.png`,
      sameAs: ['https://instagram.com/unsi.home'],
      description: 'Objets pour un quotidien plus chaleureux. Des détails pensés, une vie plus joyeuse. Bientôt au Maroc.'
    });
  }

  clearJsonLd(): void {
    this.document.querySelectorAll('script[data-seo-jsonld]').forEach((n) => n.remove());
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', 'canonical');
      this.renderer.appendChild(this.document.head, link);
    }
    this.renderer.setAttribute(link, 'href', url);
  }

  private setJsonLd(data: Record<string, unknown> | Record<string, unknown>[]): void {
    this.clearJsonLd();
    const script = this.renderer.createElement('script');
    this.renderer.setAttribute(script, 'type', 'application/ld+json');
    this.renderer.setAttribute(script, 'data-seo-jsonld', 'true');
    const payload = Array.isArray(data) ? data : [data];
    script.text = JSON.stringify(payload.length === 1 ? payload[0] : payload);
    this.renderer.appendChild(this.document.head, script);
  }

  private toAbsoluteImage(src: string): string {
    if (!src) return DEFAULT_IMAGE;
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    const path = src.startsWith('/') ? src : `/${src}`;
    return `${SITE_URL}${path}`;
  }
}
