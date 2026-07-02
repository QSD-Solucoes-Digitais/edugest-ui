import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfiguracaoService } from '../../service/configuracao.service';
import { CepService } from '../../../../shared/services/cep.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { CampoErroMensagemPipe } from '../../../../shared/pipes/campo-erro-mensagem.pipe';

@Component({
  selector: 'app-configuracao-escola',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    ToastModule,
    CampoErroMensagemPipe,
  ],
  providers: [MessageService],
  templateUrl: './configuracao-escola.component.html',
  styleUrl: './configuracao-escola.component.scss',
})
export class ConfiguracaoEscolaComponent implements OnInit {
  @ViewChild('numeroInput') numeroInput?: ElementRef<HTMLInputElement>;

  private fb = inject(FormBuilder);
  private service = inject(ConfiguracaoService);
  private messageService = inject(MessageService);
  private cepService = inject(CepService);
  private formErrorService = inject(FormErrorService);

  carregando = signal(false);
  salvando = signal(false);
  buscandoCep = signal(false);
  cepNaoEncontrado = signal(false);

  form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(150)]],
    cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)]],
    telefone: ['', [Validators.required, Validators.maxLength(15)]],
    email: ['', [Validators.required, Validators.email]],
    endereco: this.fb.group({
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      uf: ['', Validators.required],
    }),
  });

  ngOnInit() {
    this.carregarDados();
  }

  private carregarDados() {
    this.carregando.set(true);
    this.service.buscarEscola().subscribe({
      next: (escola) => {
        this.form.patchValue({
          nome: escola.nome,
          cnpj: escola.cnpj,
          telefone: escola.telefone,
          email: escola.email,
          endereco: escola.endereco,
        });
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  onCepChange(cep: string) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    this.buscandoCep.set(true);
    this.cepNaoEncontrado.set(false);

    this.cepService.buscar(cepLimpo).subscribe({
      next: (endereco) => {
        this.buscandoCep.set(false);
        if (endereco) {
          this.form.patchValue({
            endereco: {
              logradouro: endereco.logradouro,
              bairro: endereco.bairro,
              cidade: endereco.cidade,
              uf: endereco.uf,
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

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    this.service.atualizarEscola(this.form.getRawValue()).subscribe({
      next: () => {
        this.salvando.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Dados da escola atualizados com sucesso.',
          life: 4000,
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

  isInvalidEndereco(campo: string): boolean {
    const control = this.form.get(`endereco.${campo}`);
    return !!(control?.invalid && control?.touched);
  }
}
