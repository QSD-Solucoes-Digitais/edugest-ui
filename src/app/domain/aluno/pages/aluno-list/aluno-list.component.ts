import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AlunoService } from '../../service/aluno.service';
import { ResponsavelService } from '../../../responsavel/service/responsavel.service';
import { MSG } from '../../../../shared/constants/messages';
import { AlunoOutput } from '../../model/aluno.model';
import { ResponsavelOutput } from '../../../responsavel/model/responsavel.model';

@Component({
  selector: 'app-aluno-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    SelectModule,
    AutoCompleteModule,
    AvatarModule,
    ConfirmDialogModule,
    TooltipModule,
    TagModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './aluno-list.component.html',
  styleUrl: './aluno-list.component.scss',
})
export class AlunoListComponent implements OnInit {
  private service = inject(AlunoService);
  private responsavelService = inject(ResponsavelService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  alunos = signal<AlunoOutput[]>([]);
  sugestoesResponsaveis = signal<ResponsavelOutput[]>([]);
  totalRecords = signal(0);
  rows = signal(10);
  carregando = signal(false);
  paginaAtual = signal(0);

  opcoesStatus = [
    { label: 'Ativo',   value: 'ATIVO' },
    { label: 'Inativo', value: 'INATIVO' },
  ];

  filtroForm = this.fb.group({
    nome:        [''],
    matricula:   [''],
    status:      [null as string | null],
    responsavel: [null as ResponsavelOutput | null],
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

  buscarResponsaveis(event: AutoCompleteCompleteEvent) {
    this.responsavelService.listar(0, 20, 'nome,asc', { nome: event.query, status: 'ATIVO' }).subscribe({
      next: page => this.sugestoesResponsaveis.set(page.content),
    });
  }

  private carregarDados(page = 0) {
    this.carregando.set(true);
    const f = this.filtroForm.value;
    const filters: Record<string, string> = {};
    if (f.nome)        filters['nome']          = f.nome;
    if (f.matricula)   filters['matricula']     = f.matricula;
    if (f.status)      filters['status']        = f.status;
    if (f.responsavel) filters['responsavelId'] = String(f.responsavel.id);

    this.service.listar(page, this.rows(), 'nome,asc', filters).subscribe({
      next: data => {
        this.alunos.set(data.content);
        this.totalRecords.set(data.totalElements);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  confirmarInativacao(aluno: AlunoOutput) {
    this.confirmationService.confirm({
      message:                `Deseja inativar o aluno <strong>${aluno.nome}</strong>?`,
      header:                 'Confirmar inativação',
      icon:                   'pi pi-exclamation-triangle',
      acceptLabel:            'Sim, inativar',
      rejectLabel:            'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.inativar(aluno.id),
    });
  }

  private inativar(id: number) {
    this.service.inativar(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary:  'Sucesso',
          detail:   MSG.aluno.inativadoSucesso,
          life:     4000,
        });
        this.carregarDados(this.paginaAtual());
      },
      error: () => {},
    });
  }

  formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}

