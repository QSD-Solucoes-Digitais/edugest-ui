import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';
import { senhaProvisoriaChildGuard } from './core/auth/guards/senha-provisoria.guard';
import { LayoutShellComponent } from './layout/layout-shell/layout-shell.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./core/auth/pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'recuperar-senha',
    loadComponent: () =>
      import('./core/auth/pages/recuperar-senha/recuperar-senha.component').then(
        m => m.RecuperarSenhaComponent
      ),
  },
  {
    path: 'redefinir-senha',
    loadComponent: () =>
      import('./core/auth/pages/redefinir-senha/redefinir-senha.component').then(
        m => m.RedefinirSenhaComponent
      ),
  },
  {
    path: '403',
    loadComponent: () =>
      import('./shared/pages/erro-403/erro-403.component').then(m => m.Erro403Component),
  },
  {
    path: 'alterar-senha',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/auth/pages/alterar-senha/alterar-senha.component').then(
        m => m.AlterarSenhaComponent
      ),
  },
  {
    path: '',
    component: LayoutShellComponent,
    canActivate: [authGuard],
    canActivateChild: [senhaProvisoriaChildGuard],
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
        canActivate: [roleGuard],
        data: { perfis: ['ADMIN', 'SECRETARIA'] },
        children: [
          {
            path: '',
            data: { breadcrumbs: [{ label: 'Responsáveis' }] },
            loadComponent: () =>
              import('./domain/responsavel/pages/responsavel-lista/responsavel-lista.component').then(
                m => m.ResponsavelListaComponent
              ),
          },
          {
            path: 'novo',
            data: { breadcrumbs: [{ label: 'Responsáveis', routerLink: '/responsaveis' }, { label: 'Novo' }] },
            loadComponent: () =>
              import('./domain/responsavel/pages/responsavel-form/responsavel-form.component').then(
                m => m.ResponsavelFormComponent
              ),
          },
          {
            path: ':id/editar',
            data: { breadcrumbs: [{ label: 'Responsáveis', routerLink: '/responsaveis' }, { label: 'Editar' }] },
            loadComponent: () =>
              import('./domain/responsavel/pages/responsavel-form/responsavel-form.component').then(
                m => m.ResponsavelFormComponent
              ),
          },
          {
            path: ':id/detalhar',
            data: { breadcrumbs: [{ label: 'Responsáveis', routerLink: '/responsaveis' }, { label: 'Detalhes' }] },
            loadComponent: () =>
              import('./domain/responsavel/pages/responsavel-form/responsavel-form.component').then(
                m => m.ResponsavelFormComponent
              ),
          },
        ],
      },
      {
        path: 'alunos',
        canActivate: [roleGuard],
        data: { perfis: ['ADMIN', 'SECRETARIA'] },
        children: [
          {
            path: '',
            data: { breadcrumbs: [{ label: 'Alunos' }] },
            loadComponent: () =>
              import('./domain/aluno/pages/aluno-list/aluno-list.component').then(
                m => m.AlunoListComponent
              ),
          },
          {
            path: 'novo',
            data: { breadcrumbs: [{ label: 'Alunos', routerLink: '/alunos' }, { label: 'Novo' }] },
            loadComponent: () =>
              import('./domain/aluno/pages/aluno-form/aluno-form.component').then(
                m => m.AlunoFormComponent
              ),
          },
          {
            path: ':id/editar',
            data: { breadcrumbs: [{ label: 'Alunos', routerLink: '/alunos' }, { label: 'Editar' }] },
            loadComponent: () =>
              import('./domain/aluno/pages/aluno-form/aluno-form.component').then(
                m => m.AlunoFormComponent
              ),
          },
          {
            path: ':id/detalhar',
            data: { breadcrumbs: [{ label: 'Alunos', routerLink: '/alunos' }, { label: 'Detalhes' }] },
            loadComponent: () =>
              import('./domain/aluno/pages/aluno-form/aluno-form.component').then(
                m => m.AlunoFormComponent
              ),
          },
        ],
      },
      {
        path: 'mensalidades',
        canActivate: [roleGuard],
        data: { perfis: ['ADMIN', 'FINANCEIRO'] },
        children: [
          {
            path: '',
            data: { breadcrumbs: [{ label: 'Mensalidades' }] },
            loadComponent: () =>
              import('./domain/mensalidade/pages/mensalidade-list/mensalidade-list.component').then(
                m => m.MensalidadeListComponent
              ),
          },
        ],
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { perfis: ['ADMIN'] },
        children: [
          {
            path: '',
            data: { breadcrumbs: [{ label: 'Usuários' }] },
            loadComponent: () =>
              import('./domain/usuario/pages/usuario-list/usuario-list.component').then(
                m => m.UsuarioListComponent
              ),
          },
          {
            path: 'novo',
            data: { breadcrumbs: [{ label: 'Usuários', routerLink: '/usuarios' }, { label: 'Novo' }] },
            loadComponent: () =>
              import('./domain/usuario/pages/usuario-form/usuario-form.component').then(
                m => m.UsuarioFormComponent
              ),
          },
          {
            path: ':id/editar',
            data: { breadcrumbs: [{ label: 'Usuários', routerLink: '/usuarios' }, { label: 'Editar' }] },
            loadComponent: () =>
              import('./domain/usuario/pages/usuario-form/usuario-form.component').then(
                m => m.UsuarioFormComponent
              ),
          },
          {
            path: ':id/detalhar',
            data: { breadcrumbs: [{ label: 'Usuários', routerLink: '/usuarios' }, { label: 'Detalhes' }] },
            loadComponent: () =>
              import('./domain/usuario/pages/usuario-form/usuario-form.component').then(
                m => m.UsuarioFormComponent
              ),
          },
        ],
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];