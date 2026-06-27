import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ResponsavelService } from '../../service/responsavel.service';
import { MSG } from '../../../../shared/constants/messages';
import { ResponsavelOutput } from '../../model/responsavel.model';

@Component({
  selector: 'app-responsavel-lista',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    SelectModule,
    AvatarModule,
    ConfirmDialogModule,
    TooltipModule,
    TagModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './responsavel-lista.component.html',
  styleUrl: './responsavel-lista.component.scss',
})
export class ResponsavelListaComponent implements OnInit {
  private service = inject(ResponsavelService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  responsaveis = signal<ResponsavelOutput[]>([]);
  totalRecords = signal(0);
  rows = signal(10);
  carregando = signal(false);
  paginaAtual = signal(0);

  opcoesStatus = [
    { label: 'Ativo',   value: 'ATIVO' },
    { label: 'Inativo', value: 'INATIVO' },
  ];

  filtroForm = this.fb.group({
    nome:   [''],
    cpf:    [''],
    status: [null as string | null],
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
    this.carregarDados();
  }

  onCarregarDados(event: TableLazyLoadEvent) {
    const rows = event.rows ?? this.rows();
    const pagina = Math.floor((event.first ?? 0) / rows);
    this.rows.set(rows);
    this.paginaAtual.set(pagina);
    this.carregarDados(pagina);
  }

  filtrar() {
    this.paginaAtual.set(0);
    this.carregarDados(0);
  }

  limparFiltros() {
    this.filtroForm.reset();
    this.paginaAtual.set(0);
    this.carregarDados(0);
  }

  private carregarDados(page = 0) {
    this.carregando.set(true);
    const f = this.filtroForm.value;
    const filters: Record<string, string> = {};
    if (f.nome)   filters['nome']   = f.nome;
    if (f.cpf)    filters['cpf']    = f.cpf;
    if (f.status) filters['status'] = f.status;

    this.service.listar(page, this.rows(), 'nome,asc', filters).subscribe({
      next: data => {
        this.responsaveis.set(data.content);
        this.totalRecords.set(data.totalElements);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  confirmarInativacao(responsavel: ResponsavelOutput) {
    this.confirmationService.confirm({
      message:                  `Deseja inativar o responsável <strong>${responsavel.nome}</strong>?`,
      header:                   'Confirmar inativação',
      icon:                     'pi pi-exclamation-triangle',
      acceptLabel:              'Sim, inativar',
      rejectLabel:              'Cancelar',
      acceptButtonStyleClass:   'p-button-danger',
      accept: () => this.inativar(responsavel.id),
    });
  }

  private inativar(id: number) {
    this.service.excluir(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary:  'Sucesso',
          detail:   MSG.responsavel.inativadoSucesso,
          life:     4000,
        });
        this.carregarDados(this.paginaAtual());
      },
      error: () => {},
    });
  }

  formatarCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatarTelefone(tel: string): string {
    return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
}
