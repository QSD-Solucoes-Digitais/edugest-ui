import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ResponsavelService } from '../../service/responsavel.service';
import { CepService } from '../../../../shared/services/cep.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { CampoErroMensagemPipe } from '../../../../shared/pipes/campo-erro-mensagem.pipe';
import { MSG } from '../../../../shared/constants/messages';
import { ResponsavelInput } from '../../model/responsavel.model';

@Component({
  selector: 'app-responsavel-form',
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
    CampoErroMensagemPipe,
  ],
  providers: [MessageService],
  templateUrl: './responsavel-form.component.html',
  styleUrl: './responsavel-form.component.scss',
})
export class ResponsavelFormComponent implements OnInit {
  @ViewChild('numeroInput') numeroInput?: ElementRef<HTMLInputElement>;

  private fb = inject(FormBuilder);
  private service = inject(ResponsavelService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private cepService = inject(CepService);
  private formErrorService = inject(FormErrorService);

  id = signal<number | null>(null);
  salvando = signal(false);
  titulo = signal('Novo responsável');
  modoDetalhe = signal(false);
  buscandoCep = signal(false);
  cepNaoEncontrado = signal(false);

  readonly statusOpcoes = [
    { label: 'Ativo', value: 'ATIVO' },
    { label: 'Inativo', value: 'INATIVO' },
  ];

  form: FormGroup = this.fb.group({
    nome:     ['', Validators.required],
    cpf:      ['', Validators.required],
    telefone: ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    status:   ['ATIVO', Validators.required],
    endereco: this.fb.group({
      logradouro:  ['', Validators.required],
      numero:      ['', Validators.required],
      complemento: [''],
      bairro:      ['', Validators.required],
      cidade:      ['', Validators.required],
      uf:          ['', Validators.required],
      cep:         ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
    }),
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const detalhar = this.route.snapshot.url.some(s => s.path === 'detalhar');

    if (detalhar) {
      this.modoDetalhe.set(true);
      this.titulo.set('Detalhes do responsável');
    }

    if (idParam) {
      this.id.set(Number(idParam));
      if (!detalhar) this.titulo.set('Editar responsável');
      this.carregarDados(Number(idParam));
    }
  }

  onCepChange(cep: string) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    this.buscandoCep.set(true);
    this.cepNaoEncontrado.set(false);

    this.cepService.buscar(cepLimpo).subscribe({
      next: endereco => {
        this.buscandoCep.set(false);
        if (endereco) {
          this.form.patchValue({
            endereco: {
              logradouro: endereco.logradouro,
              bairro:     endereco.bairro,
              cidade:     endereco.cidade,
              uf:         endereco.uf,
            },
          });
          this.numeroInput?.nativeElement?.focus();
        } else {
          this.cepNaoEncontrado.set(true);
        }
      },
      error: () => {
        this.buscandoCep.set(false);
        this.cepNaoEncontrado.set(true);
      },
    });
  }

  converterUfMaiusculo(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.form.get('endereco.uf')?.setValue(input.value, { emitEvent: false });
  }

  private carregarDados(id: number) {
    this.service.buscarPorId(id).subscribe({
      next: data => {
        this.form.patchValue(data);
        if (this.modoDetalhe()) this.form.disable();
      },
    });
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    const payload = this.form.value as ResponsavelInput;
    const acao = this.id()
      ? this.service.atualizar(this.id()!, payload)
      : this.service.cadastrar(payload);

    acao.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary:  'Sucesso',
          detail:   this.id() ? MSG.responsavel.atualizadoSucesso : MSG.responsavel.cadastradoSucesso,
        });
        setTimeout(() => this.router.navigate(['/responsaveis']), 1500);
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

  isInvalidEndereco(campo: string): boolean {
    const control = this.form.get(`endereco.${campo}`);
    return !!(control?.invalid && control?.touched);
  }
}
