import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { PagesService } from '../../services/pages.service';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  pagesService = inject(PagesService);
  private ts = inject(TranslateService);

  ngOnInit(): void {
    this.pagesService.ensureLoaded().subscribe();
  }

  isOn(slug: string): boolean {
    return this.pagesService.isEnabled(slug);
  }

  pageLabel(slug: string, fallback: string): string {
    return this.ts.pageKey(slug) || fallback;
  }
}
