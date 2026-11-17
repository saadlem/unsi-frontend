import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { PagesService } from '../../services/pages.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  pagesService = inject(PagesService);

  ngOnInit(): void {
    this.pagesService.ensureLoaded().subscribe();
  }

  isOn(slug: string): boolean {
    return this.pagesService.isEnabled(slug);
  }
}
