import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { LayoutShellComponent } from './layout/layout-shell/layout-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        data: { breadcrumbs: [{ label: 'Início' }] },
        loadComponent: () =>
          import('./domain/dashboard/pages/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'responsaveis',
        data: { breadcrumbs: [{ label: 'Responsáveis' }] },
        loadComponent: () =>
          import(
            './domain/responsavel/pages/responsavel-lista/responsavel-lista.component'
          ).then(m => m.ResponsavelListaComponent),
      },
      {
        path: 'responsaveis/novo',
        data: { breadcrumbs: [{ label: 'Responsáveis', routerLink: '/responsaveis' }, { label: 'Novo' }] },
        loadComponent: () =>
          import(
            './domain/responsavel/pages/responsavel-form/responsavel-form.component'
          ).then(m => m.ResponsavelFormComponent),
      },
      {
        path: 'responsaveis/:id/editar',
        data: { breadcrumbs: [{ label: 'Responsáveis', routerLink: '/responsaveis' }, { label: 'Editar' }] },
        loadComponent: () =>
          import(
            './domain/responsavel/pages/responsavel-form/responsavel-form.component'
          ).then(m => m.ResponsavelFormComponent),
      },
      {
        path: 'responsaveis/:id/detalhar',
        data: { breadcrumbs: [{ label: 'Responsáveis', routerLink: '/responsaveis' }, { label: 'Detalhes' }] },
        loadComponent: () =>
          import(
            './domain/responsavel/pages/responsavel-form/responsavel-form.component'
          ).then(m => m.ResponsavelFormComponent),
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];