import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './admin/admin-products/admin-products.component';
import { AdminOrdersComponent } from './admin/admin-orders/admin-orders.component';
import { AdminOrderDetailComponent } from './admin/admin-order-detail/admin-order-detail.component';
import { AdminDiscountsComponent } from './admin/admin-discounts/admin-discounts.component';
import { AdminCategoriesComponent } from './admin/admin-categories/admin-categories.component';
import { AdminInstagramComponent } from './admin/admin-instagram/admin-instagram.component';
import { AdminSiteStatusComponent } from './admin/admin-site-status/admin-site-status.component';
import { authGuard } from './guards/auth.guard';
import { siteStatusGuard } from './guards/site-status.guard';

export const routes: Routes = [
  { path: '', canActivate: [siteStatusGuard], loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'account', canActivate: [siteStatusGuard], loadComponent: () => import('./pages/account/account.component').then(m => m.AccountComponent) },
  { path: 'products', canActivate: [siteStatusGuard], loadComponent: () => import('./components/product-list/product-list.component').then(m => m.ProductListComponent) },
  { path: 'product/:id', canActivate: [siteStatusGuard], loadComponent: () => import('./components/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'cart', canActivate: [siteStatusGuard], loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent) },
  { path: 'checkout', canActivate: [authGuard, siteStatusGuard], loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'order-confirmation', canActivate: [siteStatusGuard], loadComponent: () => import('./components/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent) },
  { path: 'infos', canActivate: [siteStatusGuard], loadComponent: () => import('./pages/infos/infos.component').then(m => m.InfosComponent) },
  { path: 'livraison', canActivate: [siteStatusGuard], loadComponent: () => import('./pages/livraison/livraison.component').then(m => m.LivraisonComponent) },
  { path: 'paiement', canActivate: [siteStatusGuard], loadComponent: () => import('./pages/paiement/paiement.component').then(m => m.PaiementComponent) },
  { path: 'faq', canActivate: [siteStatusGuard], loadComponent: () => import('./pages/faq/faq.component').then(m => m.FaqComponent) },
  { path: 'wishlist', canActivate: [authGuard, siteStatusGuard], loadComponent: () => import('./pages/wishlist/wishlist.component').then(m => m.WishlistComponent) },
  { path: 'suivi', canActivate: [siteStatusGuard], loadComponent: () => import('./pages/tracking/tracking.component').then(m => m.TrackingComponent) },
  { path: 'admin/login', redirectTo: 'account', pathMatch: 'full' },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'orders/:id', component: AdminOrderDetailComponent },
      { path: 'discounts', component: AdminDiscountsComponent },
      { path: 'instagram', component: AdminInstagramComponent },
      { path: 'site-status', component: AdminSiteStatusComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
