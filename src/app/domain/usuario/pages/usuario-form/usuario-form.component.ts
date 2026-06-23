import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { UsuarioService } from '../../service/usuario.service';
import { UsuarioInput } from '../../model/usuario.model';
import { PerfilUsuario } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CardModule,
    ToastModule,
    ToggleSwitchModule,
  ],
  providers: [MessageService],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.scss',
})
export class UsuarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(UsuarioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  id = signal<number | null>(null);
  salvando = signal(false);
  carregando = signal(false);

  get modoEdicao(): boolean {
    return this.id() !== null;
  }

  get titulo(): string {
    return this.modoEdicao ? 'Editar usuário' : 'Novo usuário';
  }

  get subtitulo(): string {
    return this.modoEdicao ? 'Atualize os dados do usuário' : 'Preencha os dados do usuário';
  }

  get labelBotaoSalvar(): string {
    return this.modoEdicao ? 'Atualizar usuário' : 'Salvar usuário';
  }

  readonly opcoesPerfil = [
    { label: 'Administrador', value: 'ADMIN' as PerfilUsuario },
    { label: 'Secretaria',    value: 'SECRETARIA' as PerfilUsuario },
    { label: 'Financeiro',    value: 'FINANCEIRO' as PerfilUsuario },
  ];

  form: FormGroup = this.fb.group({
    nome:   ['', [Validators.required, Validators.minLength(3)]],
    login:  ['', [Validators.required, Validators.email]],
    perfil: [null as PerfilUsuario | null, Validators.required],
    ativo:  [true],
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id.set(Number(idParam));
      this.form.get('login')?.disable();
      this.carregarDados(Number(idParam));
    }
  }

  private carregarDados(id: number) {
    this.carregando.set(true);
    this.service.buscarPorId(id).subscribe({
      next: (usuario) => {
        this.form.patchValue({
          nome:   usuario.nome,
          login:  usuario.login,
          perfil: usuario.perfil,
          ativo:  usuario.ativo,
        });
        this.carregando.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os dados do usuário.',
          life: 4000,
        });
        this.carregando.set(false);
      },
    });
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    const dados = this.form.getRawValue() as UsuarioInput;
    const acao = this.modoEdicao
      ? this.service.atualizar(this.id()!, dados)
      : this.service.criar(dados);

    acao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.router.navigate(['/usuarios'], {
          state: {
            toastSeverity: 'success',
            toastSummary: this.modoEdicao ? 'Sucesso' : 'Usuário criado',
            toastDetail: this.modoEdicao
              ? 'Usuário atualizado com sucesso.'
              : 'Uma senha temporária foi enviada para o e-mail cadastrado.',
          },
        });
      },
      error: (err) => {
        const detalhe = err?.error?.message
          ?? (this.modoEdicao ? 'Erro ao atualizar usuário.' : 'Erro ao criar usuário.');
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: detalhe, life: 4000 });
        this.salvando.set(false);
      },
    });
  }

  isInvalid(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control?.invalid && control?.touched);
  }

  erroMensagem(campo: string): string {
    const control = this.form.get(campo);
    if (!control) return '';
    if (control.hasError('required')) {
      const msgs: Record<string, string> = {
        nome:   'Nome é obrigatório',
        login:  'E-mail é obrigatório',
        perfil: 'Selecione um perfil',
      };
      return msgs[campo] ?? 'Campo obrigatório';
    }
    if (control.hasError('minlength')) return 'Nome deve ter ao menos 3 caracteres';
    if (control.hasError('email'))     return 'Informe um e-mail válido';
    return '';
  }
}
