import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ConfiguracaoService } from '../../service/configuracao.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { CampoErroMensagemPipe } from '../../../../shared/pipes/campo-erro-mensagem.pipe';
import { CurrencyBrPipe } from '../../../../shared/pipes/currency-br.pipe';
import { AnoLetivoOutput, ConfigFinanceiraOutput } from '../../model/configuracao.model';

@Component({
  selector: 'app-configuracao-taxas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
    DialogModule,
    InputNumberModule,
    MessageModule,
    RadioButtonModule,
    TooltipModule,
    DatePipe,
    CampoErroMensagemPipe,
    CurrencyBrPipe,
  ],
  providers: [MessageService],
  templateUrl: './configuracao-taxas.component.html',
  styleUrl: './configuracao-taxas.component.scss',
})
export class ConfiguracaoTaxasComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ConfiguracaoService);
  private messageService = inject(MessageService);
  private formErrorService = inject(FormErrorService);
  private fb = inject(FormBuilder);

  anoLetivo = signal<AnoLetivoOutput | null>(null);
  configs = signal<ConfigFinanceiraOutput[]>([]);
  totalRegistros = signal(0);
  vigenteId = signal<number | null>(null);
  carregando = signal(false);
  dialogVisivel = signal(false);
  salvando = signal(false);
  rows = signal(10);

  modoEdicao = signal(false);
  modoVisualizacao = signal(false);
  configEmEdicao = signal<ConfigFinanceiraOutput | null>(null);
  dataVigenciaPreview = signal('');

  paginaAtual = 0;

  podeCriarConfig = computed(() => {
    const ano = this.anoLetivo();
    return ano?.status === 'ATIVO' || ano?.status === 'PLANEJADO';
  });

  tituloPage = computed(() => {
    const ano = this.anoLetivo();
    return ano ? `Configurações Financeiras — ${ano.ano}` : 'Configurações Financeiras';
  });

  tituloDialog = computed(() => {
    if (this.modoVisualizacao()) return 'Detalhes da Configuração';
    if (this.modoEdicao()) return 'Editar Configuração de Taxas';
    return 'Nova Configuração de Taxas';
  });

  formConfig: FormGroup = this.fb.group({
    diaVencimento:      [null as number | null, [Validators.required, Validators.min(1), Validators.max(28)]],
    taxaMatricula:      [null as number | null],
    multaValorFixo:     [null as number | null],
    multaPercentual:    [null as number | null],
    jurosPercentualMes: [null as number | null],
    vigenciaImediata:   [false],
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('anoLetivoId'));
    this.carregarDados(id);
  }

  private carregarDados(id: number) {
    this.carregando.set(true);
    this.service.buscarAnoLetivo(id).subscribe({
      next: (ano) => {
        this.anoLetivo.set(ano);
        if (ano.status === 'ATIVO') {
          this.carregarConfigVigente(id);
        }
        this.carregarConfigs(id);
      },
      error: () => {
        this.carregando.set(false);
        this.router.navigate(['/configuracoes/anos-letivos']);
      },
    });
  }

  private carregarConfigVigente(anoLetivoId: number) {
    this.service.buscarConfigFinanceiraVigente(anoLetivoId).subscribe({
      next: (cfg) => this.vigenteId.set(cfg?.id ?? null),
      error: () => this.vigenteId.set(null),
    });
  }

  private carregarConfigs(anoLetivoId: number, page = 0) {
    this.service.listarConfigFinanceira(anoLetivoId, page, this.rows()).subscribe({
      next: (res) => {
        this.configs.set(res.content);
        this.totalRegistros.set(res.totalElements);
        this.paginaAtual = page;
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  onCarregarDados(event: TableLazyLoadEvent) {
    const anoLetivoId = this.anoLetivo()?.id;
    if (!anoLetivoId) return;
    const rows = event.rows ?? this.rows();
    const pagina = Math.floor((event.first ?? 0) / rows);
    this.rows.set(rows);
    this.carregarConfigs(anoLetivoId, pagina);
  }

  abrirNovaConfig() {
    this.modoEdicao.set(false);
    this.modoVisualizacao.set(false);
    this.configEmEdicao.set(null);
    this.formConfig.enable();
    this.formConfig.reset({ vigenciaImediata: false });
    this.atualizarPreviewVigencia(false);
    this.dialogVisivel.set(true);
  }

  abrirEdicao(config: ConfigFinanceiraOutput) {
    this.modoEdicao.set(true);
    this.modoVisualizacao.set(false);
    this.configEmEdicao.set(config);
    this.formConfig.enable();
    this.formConfig.reset({
      diaVencimento:      config.diaVencimento,
      taxaMatricula:      config.taxaMatricula ?? null,
      multaValorFixo:     config.multaValorFixo ?? null,
      multaPercentual:    config.multaPercentual ?? null,
      jurosPercentualMes: config.jurosPercentualMes ?? null,
      vigenciaImediata:   false,
    });
    // Na edição, mostrar a data de vigência atual (imutável)
    const vigencia = new Date(config.vigenteAPartir + 'T00:00:00');
    this.dataVigenciaPreview.set(vigencia.toLocaleDateString('pt-BR'));
    this.dialogVisivel.set(true);
  }

  abrirVisualizacao(config: ConfigFinanceiraOutput) {
    this.modoEdicao.set(false);
    this.modoVisualizacao.set(true);
    this.configEmEdicao.set(config);
    this.formConfig.reset({
      diaVencimento:      config.diaVencimento,
      taxaMatricula:      config.taxaMatricula ?? null,
      multaValorFixo:     config.multaValorFixo ?? null,
      multaPercentual:    config.multaPercentual ?? null,
      jurosPercentualMes: config.jurosPercentualMes ?? null,
      vigenciaImediata:   false,
    });
    this.formConfig.disable();

    const vigencia = new Date(config.vigenteAPartir + 'T00:00:00');
    this.dataVigenciaPreview.set(vigencia.toLocaleDateString('pt-BR'));
    this.dialogVisivel.set(true);
  }

  fecharDialog() {
    this.dialogVisivel.set(false);
    this.modoVisualizacao.set(false);
    this.formConfig.enable();
  }

  atualizarPreviewVigencia(imediata: boolean) {
    const data = imediata
      ? new Date()
      : (() => {
          const d = new Date();
          d.setMonth(d.getMonth() + 1);
          d.setDate(1);
          return d;
        })();

    this.dataVigenciaPreview.set(data.toLocaleDateString('pt-BR'));
  }

  podeEditar(config: ConfigFinanceiraOutput): boolean {
    const statusAno = this.anoLetivo()?.status;
    if (statusAno === 'PLANEJADO') return true;
    if (statusAno === 'ATIVO') {
      return new Date(config.vigenteAPartir + 'T00:00:00') > new Date();
    }
    return false;
  }

  salvarConfig() {
    if (this.formConfig.invalid) {
      this.formConfig.markAllAsTouched();
      return;
    }
    const anoLetivoId = this.anoLetivo()?.id;
    if (!anoLetivoId) return;

    const emEdicao = this.modoEdicao();
    const configAlvo = this.configEmEdicao();
    const input = this.formConfig.getRawValue();

    this.salvando.set(true);
    const operacao = emEdicao && configAlvo
      ? this.service.atualizarConfigFinanceira(anoLetivoId, configAlvo.id, input)
      : this.service.criarConfigFinanceira(anoLetivoId, input);

    operacao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.dialogVisivel.set(false);
        this.messageService.add({
          severity: 'success',
          summary: emEdicao ? 'Configuração atualizada' : 'Configuração criada',
          detail: emEdicao
            ? 'As taxas foram atualizadas com sucesso.'
            : `Nova configuração salva. Vigente a partir de ${this.dataVigenciaPreview()}.`,
          life: 5000,
        });
        if (this.anoLetivo()?.status === 'ATIVO') {
          this.carregarConfigVigente(anoLetivoId);
        }
        this.carregarConfigs(anoLetivoId, emEdicao ? this.paginaAtual : 0);
      },
      error: (err) => {
        this.salvando.set(false);
        const mensagem = this.formErrorService.tratar(err, this.formConfig);
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
    const control = this.formConfig.get(campo);
    return !!(control?.invalid && control?.touched);
  }

  statusConfig(cfg: ConfigFinanceiraOutput): 'vigente' | 'futura' | 'historico' | 'planejada' {
    const statusAno = this.anoLetivo()?.status;

    if (statusAno === 'CONCLUIDO') return 'historico';
    if (statusAno === 'PLANEJADO') return 'planejada';

    const hoje = new Date().toISOString().split('T')[0];
    if (cfg.vigenteAPartir > hoje) return 'futura';
    if (cfg.id === this.vigenteId()) return 'vigente';
    return 'historico';
  }

  labelStatusConfig(cfg: ConfigFinanceiraOutput): string {
    const s = this.statusConfig(cfg);
    if (s === 'vigente')   return 'Vigente';
    if (s === 'futura')    return 'Futura';
    if (s === 'planejada') return 'Planejada';
    return 'Histórico';
  }

  severidadeStatusConfig(cfg: ConfigFinanceiraOutput): 'success' | 'info' | 'secondary' {
    const s = this.statusConfig(cfg);
    if (s === 'vigente') return 'success';
    if (s === 'futura' || s === 'planejada') return 'info';
    return 'secondary';
  }

  formatarMulta(cfg: ConfigFinanceiraOutput): string {
    const partes: string[] = [];
    if (cfg.multaPercentual != null) partes.push(`${cfg.multaPercentual}%`);
    if (cfg.multaValorFixo  != null) partes.push(`R$ ${cfg.multaValorFixo.toFixed(2).replace('.', ',')}`);
    return partes.length > 0 ? partes.join(' + ') : '—';
  }
}
