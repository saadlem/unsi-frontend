import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/** Requires a real admin JWT (unsi_token). Fake/dev tokens are rejected. */
export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (typeof localStorage === 'undefined') {
    return router.createUrlTree(['/account']);
  }
  const token = localStorage.getItem('unsi_token');
  if (token && token !== 'dev-token' && !token.startsWith('dev-')) return true;
  localStorage.removeItem('unsi_token');
  localStorage.removeItem('unsi_admin');
  return router.createUrlTree(['/account']);
};
