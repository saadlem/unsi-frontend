import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './admin/admin-products/admin-products.component';
import { AdminOrdersComponent } from './admin/admin-orders/admin-orders.component';
import { AdminOrderDetailComponent } from './admin/admin-order-detail/admin-order-detail.component';
import { AdminDiscountsComponent } from './admin/admin-discounts/admin-discounts.component';
import { AdminCategoriesComponent } from './admin/admin-categories/admin-categories.component';
import { AdminSiteStatusComponent } from './admin/admin-site-status/admin-site-status.component';
import { AdminBannerComponent } from './admin/admin-banner/admin-banner.component';
import { AdminBlogComponent } from './admin/admin-blog/admin-blog.component';
import { AdminSurMesureComponent } from './admin/admin-sur-mesure/admin-sur-mesure.component';
import { AdminB2bComponent } from './admin/admin-b2b/admin-b2b.component';
import { AdminPagesComponent } from './admin/admin-pages/admin-pages.component';
import { authGuard } from './guards/auth.guard';
import { siteStatusGuard } from './guards/site-status.guard';
import { pageVisibilityGuard } from './guards/page-visibility.guard';

const pageGuards = [siteStatusGuard, pageVisibilityGuard];

export const routes: Routes = [
  { path: '', canActivate: pageGuards, loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'account', canActivate: pageGuards, loadComponent: () => import('./pages/account/account.component').then(m => m.AccountComponent) },
  { path: 'products', canActivate: pageGuards, loadComponent: () => import('./components/product-list/product-list.component').then(m => m.ProductListComponent) },
  { path: 'product/:id', canActivate: pageGuards, loadComponent: () => import('./components/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'cart', canActivate: pageGuards, loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent) },
  { path: 'checkout', canActivate: [authGuard, ...pageGuards], loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'order-confirmation', canActivate: pageGuards, loadComponent: () => import('./components/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent) },
  { path: 'infos', canActivate: pageGuards, loadComponent: () => import('./pages/infos/infos.component').then(m => m.InfosComponent) },
  { path: 'livraison', canActivate: pageGuards, loadComponent: () => import('./pages/livraison/livraison.component').then(m => m.LivraisonComponent) },
  { path: 'paiement', canActivate: pageGuards, loadComponent: () => import('./pages/paiement/paiement.component').then(m => m.PaiementComponent) },
  { path: 'faq', canActivate: pageGuards, loadComponent: () => import('./pages/faq/faq.component').then(m => m.FaqComponent) },
  { path: 'blog', canActivate: pageGuards, loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogComponent) },
  { path: 'blog/:slug', canActivate: pageGuards, loadComponent: () => import('./pages/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent) },
  { path: 'sur-mesure', canActivate: pageGuards, loadComponent: () => import('./pages/sur-mesure/sur-mesure.component').then(m => m.SurMesureComponent) },
  { path: 'b2b', canActivate: pageGuards, loadComponent: () => import('./pages/b2b/b2b.component').then(m => m.B2bComponent) },
  { path: 'wishlist', canActivate: [authGuard, ...pageGuards], loadComponent: () => import('./pages/wishlist/wishlist.component').then(m => m.WishlistComponent) },
  { path: 'suivi', canActivate: pageGuards, loadComponent: () => import('./pages/tracking/tracking.component').then(m => m.TrackingComponent) },
  { path: 'admin/login', redirectTo: 'account', pathMatch: 'full' },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'blog', component: AdminBlogComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'orders/:id', component: AdminOrderDetailComponent },
      { path: 'discounts', component: AdminDiscountsComponent },
      { path: 'site-status', component: AdminSiteStatusComponent },
      { path: 'banner', component: AdminBannerComponent },
      { path: 'pages', component: AdminPagesComponent },
      { path: 'sur-mesure', component: AdminSurMesureComponent },
      { path: 'b2b', component: AdminB2bComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
