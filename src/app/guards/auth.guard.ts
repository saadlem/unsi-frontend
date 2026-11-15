import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../environments/environment';

export const authGuard: CanActivateFn = () => {
  // Dev: no login required
  if (!environment.production && environment.skipAuth) {
    return true;
  }

  const router = inject(Router);
  if (typeof localStorage === 'undefined') {
    return router.createUrlTree(['/account']);
  }
  const token = localStorage.getItem('unsi_customer_token') || localStorage.getItem('unsi_token');
  if (token) return true;
  return router.createUrlTree(['/account']);
};
