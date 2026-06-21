import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LayoutService } from '../../core/services/layout.service';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
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
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  menuItems: MenuItem[] = [
    {
      label: 'Início',
      icon: 'pi pi-home',
      route: '/home',
    },
    {
      label: 'Responsáveis',
      icon: 'pi pi-id-card',
      expanded: false,
      children: [
        { label: 'Cadastrar', icon: 'pi pi-plus', route: '/responsaveis/novo' },
        { label: 'Consultar', icon: 'pi pi-list', route: '/responsaveis' },
      ],
    },
    {
      label: 'Alunos',
      icon: 'pi pi-users',
      expanded: false,
      children: [
        { label: 'Cadastrar', icon: 'pi pi-plus', route: '/alunos/novo' },
        { label: 'Consultar', icon: 'pi pi-list', route: '/alunos' },
      ],
    },
    {
      label: 'Mensalidades',
      icon: 'pi pi-wallet',
      expanded: false,
      children: [
        { label: 'Cobranças', icon: 'pi pi-file-export', route: '/mensalidades/cobrancas' },
        { label: 'Pagamentos', icon: 'pi pi-check-circle', route: '/mensalidades/pagamentos' },
        { label: 'Vencimentos', icon: 'pi pi-calendar-times', route: '/mensalidades/vencimentos' },
        { label: 'Planos', icon: 'pi pi-tag', route: '/mensalidades/planos' },
      ],
    },
    {
      label: 'Financeiro',
      icon: 'pi pi-chart-bar',
      expanded: false,
      children: [
        { label: 'Relatórios', icon: 'pi pi-file-pdf', route: '/financeiro/relatorios' },
        { label: 'Inadimplência', icon: 'pi pi-exclamation-triangle', route: '/financeiro/inadimplencia' },
        { label: 'Extrato', icon: 'pi pi-receipt', route: '/financeiro/extrato' },
      ],
    },
    {
      label: 'Notificações',
      icon: 'pi pi-bell',
      expanded: false,
      children: [
        { label: 'WhatsApp', icon: 'pi pi-whatsapp', route: '/notificacoes/whatsapp' },
        { label: 'E-mail', icon: 'pi pi-envelope', route: '/notificacoes/email' },
        { label: 'Histórico', icon: 'pi pi-history', route: '/notificacoes/historico' },
      ],
    },
    {
      label: 'Configurações',
      icon: 'pi pi-cog',
      route: '/configuracoes',
    },
  ];

  ngOnInit(): void {
    this.expandActive(this.router.url);
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(e => this.expandActive((e as NavigationEnd).urlAfterRedirects));
  }

  private expandActive(url: string): void {
    for (const item of this.menuItems) {
      if (item.children) {
        item.expanded = item.children.some(child => child.route === url || url.startsWith(child.route + '/'));
      }
    }
  }

  toggleMenu(item: MenuItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }
}