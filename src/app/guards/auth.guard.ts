import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../environments/environment';

export const authGuard: CanActivateFn = () => {
  // Dev: no login required
  if (!environment.production && environment.skipAuth) {
    return true;
  }

  const router = inject(Router);
  const token = localStorage.getItem('unsi_customer_token') || localStorage.getItem('unsi_token');
  if (token) return true;
  return router.createUrlTree(['/account']);
};
