import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { UsuarioService } from '../../service/usuario.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { CampoErroMensagemPipe } from '../../../../shared/pipes/campo-erro-mensagem.pipe';
import { MSG } from '../../../../shared/constants/messages';
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
    ToggleSwitchModule,
    CampoErroMensagemPipe,
  ],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.scss',
})
export class UsuarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(UsuarioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private formErrorService = inject(FormErrorService);

  id = signal<number | null>(null);
  salvando = signal(false);
  carregando = signal(false);
  modoDetalhe = signal(false);

  get modoEdicao(): boolean {
    return this.id() !== null;
  }

  get titulo(): string {
    if (this.modoDetalhe()) return 'Detalhes do usuário';
    return this.modoEdicao ? 'Editar usuário' : 'Novo usuário';
  }

  get subtitulo(): string {
    if (this.modoDetalhe()) return 'Visualize os dados do usuário';
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
    const detalhar = this.route.snapshot.url.some(s => s.path === 'detalhar');
    if (detalhar) this.modoDetalhe.set(true);

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
        if (this.modoDetalhe()) this.form.disable();
        this.carregando.set(false);
      },
      error: () => {
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
              ? MSG.usuario.atualizadoSucesso
              : MSG.usuario.criadoSucesso,
          },
        });
      },
      error: (err) => {
        this.salvando.set(false);
        const mensagem = this.formErrorService.tratar(err, this.form);
        if (mensagem) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao salvar',
            detail: mensagem,
            life: 5000,
          });
        }
      },
    });
  }

  isInvalid(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control?.invalid && control?.touched);
  }
}
