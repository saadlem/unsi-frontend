import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/** Requires a real customer or admin JWT in localStorage. */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (typeof localStorage === 'undefined') {
    return router.createUrlTree(['/account']);
  }
  const token = localStorage.getItem('unsi_customer_token') || localStorage.getItem('unsi_token');
  if (token && token !== 'dev-token' && token !== 'dev-customer-token') return true;
  return router.createUrlTree(['/account']);
};
