import { Injectable, inject } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { ResumoCard } from '../model/resumo.model';
import {FinanceiroService} from '../../financeiro/service/financeiro.service';
import {AlunoService} from '../../aluno/service/aluno.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private financeiro = inject(FinanceiroService);
  private aluno = inject(AlunoService);

  carregarResumo() {
    return forkJoin({
      financeiro: this.financeiro.resumo(),
      alunos: this.aluno.listar(0, 1, 'nome,asc', { status: 'ATIVO' }),
    }).pipe(
      map(({ financeiro, alunos }): ResumoCard[] => [
        {
          label: 'Total recebido',
          value: `R$ ${financeiro.totalRecebido.toLocaleString('pt-BR')}`,
          icon: 'pi pi-check-circle',
          color: 'green',
          sub: `${alunos.totalElements} pagamentos`,
        },
        {
          label: 'Pendentes',
          value: `R$ ${financeiro.totalPendente.toLocaleString('pt-BR')}`,
          icon: 'pi pi-clock',
          color: 'yellow',
          sub: `${financeiro.taxaInadimplencia}% inadimplência`,
        },
        {
          label: 'Vencidos',
          value: `R$ ${financeiro.totalVencido.toLocaleString('pt-BR')}`,
          icon: 'pi pi-exclamation-circle',
          color: 'red',
          sub: 'Requer atenção',
        },
        {
          label: 'Total de alunos',
          value: String(alunos.totalElements),
          icon: 'pi pi-users',
          color: 'blue',
          sub: 'alunos ativos',
        },
      ])
    );
  }
}
