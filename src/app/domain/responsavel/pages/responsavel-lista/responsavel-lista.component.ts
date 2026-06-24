import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ResponsavelService } from '../../service/responsavel.service';
import { MSG } from '../../../../shared/constants/messages';
import { ResponsavelOutput } from '../../model/responsavel.model';

@Component({
  selector: 'app-responsavel-lista',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TableModule,
    AvatarModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    TagModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './responsavel-lista.component.html',
  styleUrl: './responsavel-lista.component.scss',
})
export class ResponsavelListaComponent {
  private service = inject(ResponsavelService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  responsaveis = signal<ResponsavelOutput[]>([]);
  totalRecords = signal(0);
  rows = signal(10);
  sortField = signal('nome');
  sortOrder = signal(1);
  carregando = signal(false);

  private currentPage = 0;
  private currentFilters: Record<string, string> = {};

  onLazyLoad(event: TableLazyLoadEvent) {
    const rows = event.rows ?? this.rows();
    const page = Math.floor((event.first ?? 0) / rows);
    const sortField = (event.sortField as string) ?? this.sortField();
    const sortOrder = event.sortOrder ?? this.sortOrder();

    const rawFilters = (event.filters ?? {}) as Record<string, any>;
    const filters: Record<string, string> = {};
    for (const [field, meta] of Object.entries(rawFilters)) {
      const value = Array.isArray(meta) ? meta[0]?.value : meta?.value;
      if (value) filters[field] = value;
    }

    this.currentPage = page;
    this.currentFilters = filters;
    this.rows.set(rows);
    this.sortField.set(sortField);
    this.sortOrder.set(sortOrder);
    this.carregar(page, rows, sortField, sortOrder, filters);
  }

  private carregar(
    page: number,
    size: number,
    sortField: string,
    sortOrder: number,
    filters: Record<string, string> = {}
  ) {
    const sort = `${sortField},${sortOrder === 1 ? 'asc' : 'desc'}`;
    this.carregando.set(true);
    this.service.listar(page, size, sort, filters).subscribe({
      next: data => {
        this.responsaveis.set(data.content);
        this.totalRecords.set(data.totalElements);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  confirmarExclusao(responsavel: ResponsavelOutput) {
    this.confirmationService.confirm({
      message: `Deseja excluir o responsável <strong>${responsavel.nome}</strong>?`,
      header: 'Confirmar exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.excluir(responsavel.id),
    });
  }

  private excluir(id: number) {
    this.service.excluir(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Excluído',
          detail: MSG.responsavel.excluidoSucesso,
        });
        this.carregar(this.currentPage, this.rows(), this.sortField(), this.sortOrder(), this.currentFilters);
      },
    });
  }

  formatarCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatarTelefone(tel: string): string {
    return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
}
