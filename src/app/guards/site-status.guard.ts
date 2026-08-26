import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { map, catchError, of } from 'rxjs';

const PUBLIC_ROUTES = ['/', '/account', '/admin'];

export const siteStatusGuard: CanActivateFn = (route) => {
  const api = inject(ApiService);
  const router = inject(Router);

  const path = '/' + (route.routeConfig?.path || '');

  return api.getSiteStatus().pipe(
    map((status: any) => {
      if (status && status.mode !== 'live') {
        if (PUBLIC_ROUTES.includes(path) || path.startsWith('/admin')) {
          return true;
        }
        router.navigate(['/']);
        return false;
      }
      return true;
    }),
    catchError(() => of(true))
  );
};
