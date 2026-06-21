import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/auth/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule, BadgeModule, TooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  layout = inject(LayoutService);
  private auth = inject(AuthService);

  schoolName = 'Escola Municipal São José';
  notificationCount = 3;

  usuario = computed(() => this.auth.usuarioLogado$.value);

  nomeUsuario = computed(() => this.usuario()?.nome ?? 'Usuário');

  iniciaisUsuario = computed(() => {
    const nome = this.usuario()?.nome ?? '';
    return nome
      .split(' ')
      .filter(p => p.length > 0)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('');
  });

  perfilLabel = computed(() => {
    const perfis: Record<string, string> = {
      ADMIN: 'Administrador',
      SECRETARIA: 'Secretaria',
      FINANCEIRO: 'Financeiro',
    };
    return perfis[this.usuario()?.perfil ?? ''] ?? '';
  });

  logout(): void {
    this.auth.logout();
  }
}