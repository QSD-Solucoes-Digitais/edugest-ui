import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MSG } from '../../../../shared/constants/messages';
import { UsuarioService } from '../../service/usuario.service';
import { Usuario, UsuarioFiltro } from '../../model/usuario.model';
import { PerfilUsuario } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    TagModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.scss',
})
export class UsuarioListComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  usuarios = signal<Usuario[]>([]);
  totalRegistros = signal(0);
  carregando = signal(false);
  rows = signal(10);

  paginaAtual = 0;

  opcioesPerfil = [
    { label: 'Todos os perfis', value: null },
    { label: 'Administrador',   value: 'ADMIN' as PerfilUsuario },
    { label: 'Secretaria',      value: 'SECRETARIA' as PerfilUsuario },
    { label: 'Financeiro',      value: 'FINANCEIRO' as PerfilUsuario },
  ];

  opcoesStatus = [
    { label: 'Todos os status', value: null },
    { label: 'Ativo',           value: true },
    { label: 'Inativo',         value: false },
  ];

  filtroForm = this.fb.group({
    perfil: [null as PerfilUsuario | null],
    ativo:  [null as boolean | null],
  });

  ngOnInit() {
    const state = history.state;
    if (state?.toastSeverity) {
      history.replaceState({}, '');
      this.messageService.add({
        severity: state.toastSeverity,
        summary:  state.toastSummary,
        detail:   state.toastDetail,
        life:     4000,
      });
    }
    this.carregarUsuarios();
  }

  carregarUsuarios(page = 0) {
    this.carregando.set(true);
    const f = this.filtroForm.value;
    const filtro: UsuarioFiltro = {};
    if (f.perfil) filtro.perfil = f.perfil;
    if (f.ativo !== null && f.ativo !== undefined) filtro.ativo = f.ativo;

    this.usuarioService.listar(filtro, page, this.rows()).subscribe({
      next: (res) => {
        this.usuarios.set(res.content);
        this.totalRegistros.set(res.totalElements);
        this.paginaAtual = page;
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  onCarregarDados(event: TableLazyLoadEvent) {
    const rows = event.rows ?? this.rows();
    const pagina = Math.floor((event.first ?? 0) / rows);
    this.rows.set(rows);
    this.carregarUsuarios(pagina);
  }

  filtrar() {
    this.carregarUsuarios(0);
  }

  limparFiltros() {
    this.filtroForm.reset();
    this.carregarUsuarios(0);
  }

  novoUsuario() {
    this.router.navigate(['/usuarios/novo']);
  }

  editarUsuario(usuario: Usuario) {
    this.router.navigate(['/usuarios', usuario.id, 'editar']);
  }

  confirmarInativacao(usuario: Usuario) {
    this.confirmationService.confirm({
      message: `Deseja inativar o usuário "${usuario.nome}"?`,
      header: 'Confirmar inativação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, inativar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.inativar(usuario),
    });
  }

  private inativar(usuario: Usuario) {
    this.usuarioService.inativar(usuario.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: MSG.usuario.inativadoSucesso(usuario.nome),
          life: 4000,
        });
        this.carregarUsuarios(this.paginaAtual);
      },
      error: () => {},
    });
  }

  severidadePerfil(perfil: PerfilUsuario): 'info' | 'success' | 'warn' {
    const map: Record<PerfilUsuario, 'info' | 'success' | 'warn'> = {
      ADMIN: 'info',
      SECRETARIA: 'success',
      FINANCEIRO: 'warn',
    };
    return map[perfil];
  }

  labelPerfil(perfil: PerfilUsuario): string {
    const map: Record<PerfilUsuario, string> = {
      ADMIN: 'Administrador',
      SECRETARIA: 'Secretaria',
      FINANCEIRO: 'Financeiro',
    };
    return map[perfil];
  }
}
