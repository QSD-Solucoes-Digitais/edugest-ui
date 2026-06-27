import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { AuthService, PerfilUsuario } from '../../core/auth/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
  allowedPerfis?: PerfilUsuario[];
  disabled?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  layout = inject(LayoutService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private perfil = toSignal(this.auth.usuarioLogado$.pipe(map(u => u?.perfil ?? null)));

  private itens = signal<MenuItem[]>([
    {
      label: 'Início',
      icon: 'pi pi-home',
      route: '/dashboard',
    },
    {
      label: 'Responsáveis',
      icon: 'pi pi-id-card',
      allowedPerfis: ['ADMIN', 'SECRETARIA'],
      expanded: false,
      children: [
        { label: 'Cadastrar', icon: 'pi pi-plus', route: '/responsaveis/novo' },
        { label: 'Consultar', icon: 'pi pi-list', route: '/responsaveis' },
      ],
    },
    {
      label: 'Alunos',
      icon: 'pi pi-users',
      allowedPerfis: ['ADMIN', 'SECRETARIA'],
      expanded: false,
      children: [
        { label: 'Cadastrar', icon: 'pi pi-plus', route: '/alunos/novo' },
        { label: 'Consultar', icon: 'pi pi-list', route: '/alunos' },
      ],
    },
    {
      label: 'Mensalidades',
      icon: 'pi pi-wallet',
      allowedPerfis: ['ADMIN', 'FINANCEIRO'],
      expanded: false,
      children: [
        { label: 'Cobranças',   icon: 'pi pi-file-export',         route: '/mensalidades/cobrancas',   disabled: true },
        { label: 'Pagamentos',  icon: 'pi pi-check-circle',         route: '/mensalidades/pagamentos',  disabled: true },
        { label: 'Vencimentos', icon: 'pi pi-calendar-times',       route: '/mensalidades/vencimentos', disabled: true },
        { label: 'Planos',      icon: 'pi pi-tag',                  route: '/mensalidades/planos',      disabled: true },
      ],
    },
    {
      label: 'Financeiro',
      icon: 'pi pi-chart-bar',
      allowedPerfis: ['ADMIN', 'FINANCEIRO'],
      expanded: false,
      children: [
        { label: 'Relatórios',    icon: 'pi pi-file-pdf',             route: '/financeiro/relatorios',    disabled: true },
        { label: 'Inadimplência', icon: 'pi pi-exclamation-triangle', route: '/financeiro/inadimplencia', disabled: true },
        { label: 'Extrato',       icon: 'pi pi-receipt',              route: '/financeiro/extrato',       disabled: true },
      ],
    },
    {
      label: 'Notificações',
      icon: 'pi pi-bell',
      expanded: false,
      children: [
        { label: 'WhatsApp', icon: 'pi pi-whatsapp', route: '/notificacoes/whatsapp', disabled: true },
        { label: 'E-mail',   icon: 'pi pi-envelope', route: '/notificacoes/email',    disabled: true },
        { label: 'Histórico',icon: 'pi pi-history',  route: '/notificacoes/historico',disabled: true },
      ],
    },
    {
      label: 'Usuários',
      icon: 'pi pi-shield',
      allowedPerfis: ['ADMIN'],
      expanded: false,
      children: [
        { label: 'Cadastrar', icon: 'pi pi-plus', route: '/usuarios/novo' },
        { label: 'Consultar', icon: 'pi pi-list', route: '/usuarios' },
      ],
    },
    {
      label: 'Configurações',
      icon: 'pi pi-cog',
      route: '/configuracoes',
      disabled: true,
    },
  ]);

  menuItems = computed(() => {
    const perfil = this.perfil();
    return this.itens().filter(
      item => !item.allowedPerfis || !perfil || item.allowedPerfis.includes(perfil)
    );
  });

  ngOnInit(): void {
    this.expandActive(this.router.url);
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(e => this.expandActive((e as NavigationEnd).urlAfterRedirects));
  }

  toggleMenu(item: MenuItem): void {
    if (!item.children) return;
    this.itens.update(lista =>
      lista.map(i => (i.label === item.label ? { ...i, expanded: !i.expanded } : i))
    );
  }

  private expandActive(url: string): void {
    this.itens.update(lista =>
      lista.map(item => ({
        ...item,
        expanded: item.children
          ? item.children.some(c => c.route === url || url.startsWith((c.route ?? '') + '/'))
          : item.expanded,
      }))
    );
  }
}