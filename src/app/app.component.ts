import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule, ViewportScroller } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'unsi-shop';
  private router = inject(Router);
  private viewport = inject(ViewportScroller);

  hideLayout = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url.startsWith('/admin') || this.router.url === '/account' || this.router.url.startsWith('/account'))
    ),
    { initialValue: this.router.url.startsWith('/admin') || this.router.url.startsWith('/account') }
  );

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const tree = this.router.parseUrl(e.urlAfterRedirects);
        const fragment = tree.fragment;
        if (fragment) {
          // Wait a tick for the destination view to render
          setTimeout(() => this.viewport.scrollToAnchor(fragment), 50);
        } else {
          this.viewport.scrollToPosition([0, 0]);
        }
      });
  }
}
