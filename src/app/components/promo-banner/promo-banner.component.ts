import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-promo-banner',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './promo-banner.component.html',
  styleUrl: './promo-banner.component.css'
})
export class PromoBannerComponent implements OnInit {
  visible = true;

  ngOnInit(): void {
    this.visible = localStorage.getItem('promo-banner-closed') !== 'true';
  }

  dismiss(): void {
    this.visible = false;
    localStorage.setItem('promo-banner-closed', 'true');
  }
}
