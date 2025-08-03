import { Injectable, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private defaultImage = 'https://kalaguragampa.com/assets/og-image.jpg';
  private defaultDescription = 'Shop premium handmade herbal products made with natural ingredients.';
  private siteName = 'Kalagura Gampa';

  constructor(
    private titleService: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  update(title: string, description?: string, keywords?: string, imageUrl?: string): void {
    const finalTitle = `${title} | ${this.siteName}`;
    const finalDescription = description || this.defaultDescription;
    const finalImage = imageUrl || this.defaultImage;

    // ✅ Page Title
    this.titleService.setTitle(finalTitle);

    // ✅ Standard Meta Tags
    this.meta.updateTag({ name: 'description', content: finalDescription });
    this.meta.updateTag({ name: 'keywords', content: keywords || '' });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    // ✅ Open Graph Tags
    this.meta.updateTag({ property: 'og:title', content: finalTitle });
    this.meta.updateTag({ property: 'og:description', content: finalDescription });
    this.meta.updateTag({ property: 'og:type', content: 'product' });
    this.meta.updateTag({ property: 'og:image', content: finalImage });
    this.meta.updateTag({ property: 'og:url', content: this.document.URL });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });

    // ✅ Twitter Card Tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: finalTitle });
    this.meta.updateTag({ name: 'twitter:description', content: finalDescription });
    this.meta.updateTag({ name: 'twitter:image', content: finalImage });
  }

  setCanonical(url: string): void {
    let link: HTMLLinkElement = this.document.querySelector("link[rel='canonical']") || this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    this.document.head.appendChild(link);
  }

  injectStructuredData(data: any): void {
    // Remove existing structured data if any
    const existing = this.document.querySelector('script[type="application/ld+json"]');
    if (existing) existing.remove();

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }
}
