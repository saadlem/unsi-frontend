import { AfterViewInit, Directive, ElementRef, OnDestroy, inject, input } from '@angular/core';

@Directive({
  selector: '[appReveal]',
  standalone: true
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  readonly delay = input('0ms', { alias: 'appRevealDelay' });

  private observer?: IntersectionObserver;
  private shown = false;

  ngAfterViewInit(): void {
    const node = this.el.nativeElement;
    node.classList.add('motion-reveal');
    node.style.setProperty('--motion-delay', this.delay());

    if (typeof window === 'undefined') {
      this.show();
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.show();
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.show();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
    );

    this.observer.observe(node);

    // Fallback: if already visible (or observer is slow), force play shortly after mount
    requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh * 0.92 && rect.bottom > 0) {
        this.show();
        this.observer?.disconnect();
      }
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private show(): void {
    if (this.shown) return;
    this.shown = true;
    const node = this.el.nativeElement;
    // Two frames so the browser paints the hidden state before animating in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        node.classList.add('is-inview');
      });
    });
  }
}
