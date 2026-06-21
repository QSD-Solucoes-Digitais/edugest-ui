import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResumoFinanceiro, RelatorioMensal } from '../model/relatorio.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/financeiro`;

  resumo() {
    return this.http.get<ResumoFinanceiro>(`${this.url}/resumo`);
  }

  relatorioMensal(ano: number) {
    return this.http.get<RelatorioMensal[]>(`${this.url}/mensal?ano=${ano}`);
  }
}
