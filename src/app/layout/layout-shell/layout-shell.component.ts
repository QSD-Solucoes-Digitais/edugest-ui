import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { LayoutService } from '../../core/services/layout.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent, BreadcrumbModule, CardModule, ProgressSpinnerModule],
  templateUrl: './layout-shell.component.html',
  styleUrl: './layout-shell.component.scss',
})
export class LayoutShellComponent {
  layout = inject(LayoutService);
  loadingService = inject(LoadingService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  breadcrumbs = signal<MenuItem[]>([]);
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/dashboard' };

  constructor() {
    this.buildBreadcrumbs();
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buildBreadcrumbs());
  }

  private buildBreadcrumbs(): void {
    let route = this.activatedRoute.root;
    while (route.firstChild) route = route.firstChild;
    this.breadcrumbs.set(route.snapshot?.data?.['breadcrumbs'] ?? []);
  }
}