import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { PagesService } from '../services/pages.service';

/** Map route path patterns to managed page slugs. */
function slugForRoute(routePath: string | undefined): string | null {
  const path = routePath || '';
  if (path === '') return 'home';
  if (path === 'products' || path === 'product/:id') return 'products';
  if (path === 'sur-mesure') return 'sur-mesure';
  if (path === 'b2b') return 'b2b';
  if (path === 'blog' || path === 'blog/:slug') return 'blog';
  if (path === 'infos') return 'infos';
  if (path === 'livraison') return 'livraison';
  if (path === 'paiement') return 'paiement';
  if (path === 'faq') return 'faq';
  if (path === 'suivi') return 'suivi';
  if (path === 'wishlist') return 'wishlist';
  if (path === 'account') return 'account';
  if (path === 'cart' || path === 'checkout' || path === 'order-confirmation') return 'cart';
  return null;
}

export const pageVisibilityGuard: CanActivateFn = (route) => {
  const pages = inject(PagesService);
  const router = inject(Router);
  const slug = slugForRoute(route.routeConfig?.path);

  return pages.ensureLoaded().pipe(
    map(() => {
      if (!slug || pages.isEnabled(slug)) return true;
      router.navigate(['/']);
      return false;
    })
  );
};
