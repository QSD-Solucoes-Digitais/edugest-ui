import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DrawerModule } from 'primeng/drawer';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsuarioService } from '../../service/usuario.service';
import { Usuario, UsuarioFiltro, UsuarioInput } from '../../model/usuario.model';
import { PerfilUsuario } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    DrawerModule,
    ConfirmDialogModule,
    ToastModule,
    SkeletonModule,
    ToggleSwitchModule,
    TooltipModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.scss',
})
export class UsuarioListComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  usuarios = signal<Usuario[]>([]);
  totalRegistros = signal(0);
  carregando = signal(false);
  salvando = signal(false);

  tamanhoPagina = 10;
  paginaAtual = 0;
  drawerVisivel = false;
  modoEdicao = false;
  usuarioEmEdicao: Usuario | null = null;

  opcioesPerfil = [
    { label: 'Todos os perfis', value: null },
    { label: 'Administrador', value: 'ADMIN' as PerfilUsuario },
    { label: 'Secretaria', value: 'SECRETARIA' as PerfilUsuario },
    { label: 'Financeiro', value: 'FINANCEIRO' as PerfilUsuario },
  ];

  opcoesStatus = [
    { label: 'Todos os status', value: null },
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false },
  ];

  opcoesPerfisForm = [
    { label: 'Administrador', value: 'ADMIN' as PerfilUsuario },
    { label: 'Secretaria', value: 'SECRETARIA' as PerfilUsuario },
    { label: 'Financeiro', value: 'FINANCEIRO' as PerfilUsuario },
  ];

  filtroForm = this.fb.group({
    perfil: [null as PerfilUsuario | null],
    ativo: [null as boolean | null],
  });

  formulario = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    login: ['', [Validators.required, Validators.email]],
    perfil: [null as PerfilUsuario | null, Validators.required],
    ativo: [true],
  });

  get tituloDrawer(): string {
    return this.modoEdicao ? 'Editar Usuário' : 'Novo Usuário';
  }

  get nomeInvalido(): boolean {
    const c = this.formulario.get('nome')!;
    return c.invalid && c.touched;
  }

  get loginInvalido(): boolean {
    const c = this.formulario.get('login')!;
    return c.invalid && c.touched;
  }

  get perfilInvalido(): boolean {
    const c = this.formulario.get('perfil')!;
    return c.invalid && c.touched;
  }

  get erroNome(): string {
    const c = this.formulario.get('nome')!;
    if (c.hasError('required')) return 'Nome é obrigatório';
    if (c.hasError('minlength')) return 'Nome deve ter ao menos 3 caracteres';
    return '';
  }

  get erroLogin(): string {
    const c = this.formulario.get('login')!;
    if (c.hasError('required')) return 'E-mail é obrigatório';
    if (c.hasError('email')) return 'Informe um e-mail válido';
    return '';
  }

  ngOnInit() {
    this.carregarUsuarios();
  }

  carregarUsuarios(page = 0) {
    this.carregando.set(true);
    const f = this.filtroForm.value;
    const filtro: UsuarioFiltro = {};
    if (f.perfil) filtro.perfil = f.perfil;
    if (f.ativo !== null && f.ativo !== undefined) filtro.ativo = f.ativo;

    this.usuarioService.listar(filtro, page, this.tamanhoPagina).subscribe({
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
    const pagina = Math.floor((event.first ?? 0) / (event.rows ?? this.tamanhoPagina));
    this.tamanhoPagina = event.rows ?? 10;
    this.carregarUsuarios(pagina);
  }

  filtrar() {
    this.carregarUsuarios(0);
  }

  limparFiltros() {
    this.filtroForm.reset();
    this.carregarUsuarios(0);
  }

  abrirDrawerNovo() {
    this.modoEdicao = false;
    this.usuarioEmEdicao = null;
    this.formulario.reset({ ativo: true });
    this.formulario.get('login')?.enable();
    this.drawerVisivel = true;
  }

  abrirDrawerEdicao(usuario: Usuario) {
    this.modoEdicao = true;
    this.usuarioEmEdicao = usuario;
    this.formulario.patchValue({
      nome: usuario.nome,
      login: usuario.login,
      perfil: usuario.perfil,
      ativo: usuario.ativo,
    });
    this.formulario.get('login')?.disable();
    this.drawerVisivel = true;
  }

  fecharDrawer() {
    this.drawerVisivel = false;
    this.formulario.reset();
  }

  salvar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    const dados = this.formulario.getRawValue() as UsuarioInput;

    if (this.modoEdicao && this.usuarioEmEdicao) {
      const id = this.usuarioEmEdicao.id;
      this.usuarioService.atualizar(id, dados).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Usuário atualizado com sucesso.',
          });
          this.salvando.set(false);
          this.fecharDrawer();
          this.carregarUsuarios(this.paginaAtual);
        },
        error: (err) => {
          const detalhe = err?.error?.message ?? 'Erro ao atualizar usuário.';
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: detalhe });
          this.salvando.set(false);
        },
      });
    } else {
      this.usuarioService.criar(dados).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Usuário criado',
            detail: 'Uma senha temporária foi enviada para o e-mail cadastrado.',
          });
          this.salvando.set(false);
          this.fecharDrawer();
          this.carregarUsuarios(0);
        },
        error: (err) => {
          const detalhe = err?.error?.message ?? 'Erro ao criar usuário.';
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: detalhe });
          this.salvando.set(false);
        },
      });
    }
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
          detail: `Usuário "${usuario.nome}" inativado.`,
        });
        this.carregarUsuarios(this.paginaAtual);
      },
      error: (err) => {
        const detalhe = err?.error?.message ?? 'Erro ao inativar usuário.';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: detalhe });
      },
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
