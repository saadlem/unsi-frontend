import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly STORAGE_KEY = 'unsi-wishlist';
  items = signal<number[]>(this.load());
  count = computed(() => this.items().length);

  private load(): number[] {
    if (typeof localStorage === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  toggle(productId: number): void {
    const current = this.items();
    if (current.includes(productId)) {
      this.items.set(current.filter(id => id !== productId));
    } else {
      this.items.set([...current, productId]);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items()));
    }
  }

  isWishlisted(productId: number): boolean {
    return this.items().includes(productId);
  }
}
