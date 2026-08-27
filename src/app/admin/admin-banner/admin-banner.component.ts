import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-banner',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-banner.component.html',
  styleUrl: './admin-banner.component.css'
})
export class AdminBannerComponent implements OnInit {
  private http = inject(HttpClient);

  banner: any = { enabled: 1, message: '', link: '', text_color: '#FFFFFF', background: '#0D47A1' };
  saving = false;
  saved = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.get<any>('/api/admin/banner').subscribe(data => {
      this.banner = { ...this.banner, ...data };
    });
  }

  save(): void {
    this.saving = true;
    this.saved = false;
    this.http.put<any>('/api/admin/banner', this.banner).subscribe({
      next: (data) => {
        this.banner = { ...this.banner, ...data };
        this.saving = false;
        this.saved = true;
        setTimeout(() => this.saved = false, 3000);
      },
      error: () => {
        this.saving = false;
      }
    });
  }
}
