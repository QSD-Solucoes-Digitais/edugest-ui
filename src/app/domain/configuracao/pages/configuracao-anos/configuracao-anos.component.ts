import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfiguracaoService } from '../../service/configuracao.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { CampoErroMensagemPipe } from '../../../../shared/pipes/campo-erro-mensagem.pipe';
import {
  AnoLetivoFiltro,
  AnoLetivoInput,
  AnoLetivoOutput,
  StatusAnoLetivo,
  TipoPeriodoLetivo,
} from '../../model/configuracao.model';

@Component({
  selector: 'app-configuracao-anos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    CampoErroMensagemPipe,
    DatePipe,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './configuracao-anos.component.html',
  styleUrl: './configuracao-anos.component.scss',
})
export class ConfiguracaoAnosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private service = inject(ConfiguracaoService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private formErrorService = inject(FormErrorService);

  anosLetivos = signal<AnoLetivoOutput[]>([]);
  totalRegistros = signal(0);
  carregando = signal(false);
  salvandoAno = signal(false);
  dialogNovoAnoVisivel = signal(false);
  rows = signal(10);

  paginaAtual = 0;

  readonly opcoesTipoPeriodo = [
    { label: 'Anual',      value: 'ANUAL' as TipoPeriodoLetivo },
    { label: 'Semestral',  value: 'SEMESTRAL' as TipoPeriodoLetivo },
    { label: 'Bimestral',  value: 'BIMESTRAL' as TipoPeriodoLetivo },
    { label: 'Trimestral', value: 'TRIMESTRAL' as TipoPeriodoLetivo },
  ];

  formNovoAno: FormGroup = this.fb.group({
    ano:            [null as number | null, [Validators.required, Validators.min(2020), Validators.max(2099)]],
    tipoPeriodo:    [null as TipoPeriodoLetivo | null, Validators.required],
    dataInicio:     [null as Date | null, Validators.required],
    dataTermino:    [null as Date | null, Validators.required],
    numeroParcelas: [null as number | null, [Validators.required, Validators.min(1), Validators.max(24)]],
  });

  filtroForm: FormGroup = this.fb.group({
    ano: [null as number | null],
  });

  ngOnInit() {
    this.carregar();
  }

  private carregar(page = 0) {
    this.carregando.set(true);
    const f = this.filtroForm.value;
    const filtro: AnoLetivoFiltro = {};
    if (f.ano) filtro.ano = f.ano;

    this.service.listarAnosLetivos(filtro, page, this.rows()).subscribe({
      next: (res) => {
        this.anosLetivos.set(res.content);
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
    this.carregar(pagina);
  }

  filtrar() {
    this.carregar(0);
  }

  limparFiltros() {
    this.filtroForm.reset();
    this.carregar(0);
  }

  verTaxas(ano: AnoLetivoOutput) {
    this.router.navigate(['/configuracoes/anos-letivos', ano.id, 'taxas']);
  }

  confirmarAtivacao(ano: AnoLetivoOutput) {
    this.confirmationService.confirm({
      message:     `Deseja ativar o ano letivo <strong>${ano.ano}</strong>?<br>O ano letivo atual será marcado como concluído.`,
      header:      'Confirmar ativação',
      icon:        'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, ativar',
      rejectLabel: 'Cancelar',
      accept: () => this.ativar(ano),
    });
  }

  private ativar(ano: AnoLetivoOutput) {
    this.service.ativarAnoLetivo(ano.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary:  'Sucesso',
          detail:   `Ano letivo ${ano.ano} ativado com sucesso.`,
          life:     4000,
        });
        this.carregar(this.paginaAtual);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary:  'Erro',
          detail:   err?.error?.title ?? 'Erro ao ativar ano letivo.',
          life:     5000,
        });
      },
    });
  }

  confirmarProximoAno(ano: AnoLetivoOutput) {
    const proximoAno = ano.ano + 1;
    this.confirmationService.confirm({
      message:     `Deseja criar a configuração para <strong>${proximoAno}</strong> com base em <strong>${ano.ano}</strong>?`,
      header:      `Preparar ano letivo ${proximoAno}`,
      icon:        'pi pi-calendar-plus',
      acceptLabel: `Sim, criar ${proximoAno}`,
      rejectLabel: 'Cancelar',
      accept: () => this.prepararProximoAno(ano),
    });
  }

  private prepararProximoAno(ano: AnoLetivoOutput) {
    this.service.prepararProximoAno(ano.id).subscribe({
      next: (novo) => {
        this.messageService.add({
          severity: 'success',
          summary:  'Sucesso',
          detail:   `Ano letivo ${novo.ano} criado com sucesso.`,
          life:     4000,
        });
        this.carregar(0);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary:  'Erro',
          detail:   err?.error?.title ?? 'Erro ao preparar próximo ano.',
          life:     5000,
        });
      },
    });
  }

  abrirDialogNovoAno() {
    this.formNovoAno.reset();
    this.dialogNovoAnoVisivel.set(true);
  }

  salvarNovoAno() {
    if (this.formNovoAno.invalid) {
      this.formNovoAno.markAllAsTouched();
      return;
    }

    const v = this.formNovoAno.getRawValue();
    const input: AnoLetivoInput = {
      ano:            v.ano,
      tipoPeriodo:    v.tipoPeriodo,
      dataInicio:     this.formatarData(v.dataInicio),
      dataTermino:    this.formatarData(v.dataTermino),
      numeroParcelas: v.numeroParcelas,
    };

    this.salvandoAno.set(true);
    this.service.criarAnoLetivo(input).subscribe({
      next: (novo) => {
        this.salvandoAno.set(false);
        this.dialogNovoAnoVisivel.set(false);
        this.messageService.add({
          severity: 'success',
          summary:  'Sucesso',
          detail:   `Ano letivo ${novo.ano} criado com sucesso.`,
          life:     4000,
        });
        this.carregar(0);
      },
      error: (err) => {
        this.salvandoAno.set(false);
        const mensagem = this.formErrorService.tratar(err, this.formNovoAno);
        if (mensagem) {
          this.messageService.add({
            severity: 'error',
            summary:  'Erro',
            detail:   mensagem,
            life:     5000,
          });
        }
      },
    });
  }

  labelPeriodo(tipo: TipoPeriodoLetivo): string {
    const map: Record<TipoPeriodoLetivo, string> = {
      ANUAL: 'Anual', SEMESTRAL: 'Semestral', BIMESTRAL: 'Bimestral', TRIMESTRAL: 'Trimestral',
    };
    return map[tipo];
  }

  labelStatus(status: StatusAnoLetivo): string {
    const map: Record<StatusAnoLetivo, string> = {
      ATIVO: 'Ativo', CONCLUIDO: 'Concluído', PLANEJADO: 'Planejado',
    };
    return map[status];
  }

  severidadeStatus(status: StatusAnoLetivo): 'success' | 'info' | 'secondary' {
    const map: Record<StatusAnoLetivo, 'success' | 'info' | 'secondary'> = {
      ATIVO: 'success', CONCLUIDO: 'secondary', PLANEJADO: 'info',
    };
    return map[status];
  }

  isInvalidNovoAno(campo: string): boolean {
    const control = this.formNovoAno.get(campo);
    return !!(control?.invalid && control?.touched);
  }

  private formatarData(data: Date | null): string {
    if (!data) return '';
    const d = new Date(data);
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }
}
