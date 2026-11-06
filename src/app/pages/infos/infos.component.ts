import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-infos',
  standalone: true,
  imports: [],
  templateUrl: './infos.component.html',
  styleUrls: ['./infos.component.css']
})
export class InfosComponent implements OnInit {
  private seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'À propos',
      description: 'Découvrez UNSI — objets pour un quotidien plus chaleureux. Détails pensés, vie joyeuse.',
      url: '/infos'
    });
  }
}
