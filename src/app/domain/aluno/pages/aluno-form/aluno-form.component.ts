import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { AlunoService } from '../../service/aluno.service';
import { ResponsavelService } from '../../../responsavel/service/responsavel.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { CampoErroMensagemPipe } from '../../../../shared/pipes/campo-erro-mensagem.pipe';
import { ResponsavelOutput } from '../../../responsavel/model/responsavel.model';
import { MSG } from '../../../../shared/constants/messages';
import { AlunoInput, GeneroAluno } from '../../model/aluno.model';

@Component({
  selector: 'app-aluno-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    AutoCompleteModule,
    DatePickerModule,
    CardModule,
    CampoErroMensagemPipe,
  ],
  templateUrl: './aluno-form.component.html',
  styleUrl: './aluno-form.component.scss',
})
export class AlunoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(AlunoService);
  private responsavelService = inject(ResponsavelService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private formErrorService = inject(FormErrorService);

  id = signal<number | null>(null);
  salvando = signal(false);
  carregando = signal(false);
  modoDetalhe = signal(false);
  sugestoesResponsaveis = signal<ResponsavelOutput[]>([]);
  responsavelSelecionado = signal<{ id: number; nome: string } | null>(null);
  matricula = signal<string | null>(null);

  readonly hoje = new Date();

  opcoesGenero = [
    { label: 'Masculino',     value: 'MASCULINO' },
    { label: 'Feminino',      value: 'FEMININO' },
    { label: 'Não informado', value: 'NAO_INFORMADO' },
  ];

  get modoEdicao(): boolean {
    return this.id() !== null;
  }

  get titulo(): string {
    if (this.modoDetalhe()) return 'Detalhes do aluno';
    return this.modoEdicao ? 'Editar aluno' : 'Novo aluno';
  }

  get subtitulo(): string {
    if (this.modoDetalhe()) return 'Visualize os dados do aluno';
    return this.modoEdicao ? 'Atualize os dados do aluno' : 'Preencha os dados do aluno';
  }

  get labelBotaoSalvar(): string {
    return this.modoEdicao ? 'Atualizar aluno' : 'Cadastrar aluno';
  }

  form = this.fb.group({
    nome:            ['', [Validators.required, Validators.minLength(3)]],
    dataNascimento:  [null as Date | null, Validators.required],
    cpf:             [''],
    genero:          [null as GeneroAluno | null, Validators.required],
    responsavelId:   [null as number | null, Validators.required],
  });

  ngOnInit() {
    const detalhar = this.route.snapshot.url.some(s => s.path === 'detalhar');
    if (detalhar) this.modoDetalhe.set(true);

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id.set(Number(idParam));
      this.carregarDados(Number(idParam));
    }
  }

  buscarResponsaveis(event: AutoCompleteCompleteEvent) {
    const query = event.query.trim();
    const isCpf = /^\d[\d.\-]*$/.test(query);
    const filters: Record<string, string> = isCpf
      ? { cpf: query, status: 'ATIVO' }
      : { nome: query, status: 'ATIVO' };
    this.responsavelService.listar(0, 20, 'nome,asc', filters).subscribe({
      next: page => this.sugestoesResponsaveis.set(page.content),
    });
  }

  onResponsavelChange(value: ResponsavelOutput | string | null) {
    if (value && typeof value === 'object') {
      this.responsavelSelecionado.set({ id: value.id, nome: value.nome });
      this.form.patchValue({ responsavelId: value.id });
    } else if (!value || value === '') {
      this.responsavelSelecionado.set(null);
      this.form.patchValue({ responsavelId: null });
    }
    this.form.get('responsavelId')?.markAsTouched();
  }

  private carregarDados(id: number) {
    this.carregando.set(true);
    this.service.buscarPorId(id).subscribe({
      next: aluno => {
        const [ano, mes, dia] = aluno.dataNascimento.split('-').map(Number);
        this.matricula.set(aluno.matricula);
        this.responsavelSelecionado.set(
          aluno.responsavelId && aluno.responsavelNome
            ? { id: aluno.responsavelId, nome: aluno.responsavelNome }
            : null
        );
        this.form.patchValue({
          nome:           aluno.nome,
          dataNascimento: new Date(ano, mes - 1, dia),
          cpf:            aluno.cpf ?? '',
          genero:        aluno.genero,
          responsavelId: aluno.responsavelId,
        });
        if (this.modoDetalhe()) this.form.disable();
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    const raw = this.form.getRawValue();
    const payload: AlunoInput = {
      nome:           raw.nome!,
      dataNascimento: this.formatarData(raw.dataNascimento!),
      cpf:            raw.cpf || undefined,
      genero:         raw.genero!,
      responsavelId:  raw.responsavelId!,
    };

    const acao = this.modoEdicao
      ? this.service.atualizar(this.id()!, payload)
      : this.service.cadastrar(payload);

    acao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.router.navigate(['/alunos'], {
          state: {
            toastSeverity: 'success',
            toastSummary:  'Sucesso',
            toastDetail:   this.modoEdicao
              ? MSG.aluno.atualizadoSucesso
              : MSG.aluno.cadastradoSucesso,
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

  formatarCpf(event: Event) {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');
    if (valor.length <= 11) {
      valor = valor
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    input.value = valor;
    this.form.get('cpf')?.setValue(valor, { emitEvent: false });
  }

  private formatarData(data: Date): string {
    const ano  = data.getFullYear();
    const mes  = String(data.getMonth() + 1).padStart(2, '0');
    const dia  = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}
