import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private router = inject(ActivatedRoute);

  updateTags(config: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    keywords?: string;
  }): void {
    const siteName = 'UNSI Céramique';

    if (config.title) {
      this.title.setTitle(config.title.includes(siteName) ? config.title : `${config.title} — ${siteName}`);
    }

    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
    }

    if (config.title) {
      this.meta.updateTag({ property: 'og:title', content: config.title });
    }

    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
      this.meta.updateTag({ name: 'twitter:image', content: config.image });
    }

    if (config.url) {
      this.meta.updateTag({ property: 'og:url', content: `https://unsi.ma${config.url}` });
    }

    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: siteName });

    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }
  }
}
