import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = '/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Public
  getProducts(category?: string, search?: string): Observable<any[]> {
    let params: any = {};
    if (category && category !== 'All') params.category = category;
    if (search) params.search = search;
    return this.http.get<any[]>(`${this.apiUrl}/products`, { params });
  }

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products/${id}`);
  }

  createOrder(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, data);
  }

  // Admin - Products
  adminGetProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/products`, { headers: this.getAuthHeaders() });
  }

  adminCreateProduct(product: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/products`, product, { headers: this.getAuthHeaders() });
  }

  adminUpdateProduct(id: number, product: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/products/${id}`, product, { headers: this.getAuthHeaders() });
  }

  adminUpdateStock(id: number, stock: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/products/${id}/stock`, { stock }, { headers: this.getAuthHeaders() });
  }

  adminDeleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/products/${id}`, { headers: this.getAuthHeaders() });
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/admin/upload`, formData, { headers: this.getAuthHeaders() });
  }

  // Categories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

  adminGetCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/categories`, { headers: this.getAuthHeaders() });
  }

  adminCreateCategory(cat: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/categories`, cat, { headers: this.getAuthHeaders() });
  }

  adminUpdateCategory(id: number, cat: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/categories/${id}`, cat, { headers: this.getAuthHeaders() });
  }

  adminDeleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/categories/${id}`, { headers: this.getAuthHeaders() });
  }

  // Admin - Orders
  adminGetOrders(status?: string): Observable<any[]> {
    let params: any = {};
    if (status && status !== 'all') params.status = status;
    return this.http.get<any[]>(`${this.apiUrl}/admin/orders`, { headers: this.getAuthHeaders(), params });
  }

  adminGetOrderStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/orders/stats`, { headers: this.getAuthHeaders() });
  }

  adminGetOrder(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/orders/${id}`, { headers: this.getAuthHeaders() });
  }

  adminUpdateOrder(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/orders/${id}`, data, { headers: this.getAuthHeaders() });
  }

  adminDeleteOrder(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/orders/${id}`, { headers: this.getAuthHeaders() });
  }

  getSiteStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/site-status`);
  }
}
