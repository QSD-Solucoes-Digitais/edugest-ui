import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Page } from '../../../core/models/page.model';
import {
  AnoLetivoFiltro,
  AnoLetivoInput,
  AnoLetivoOutput,
  ConfigFinanceiraInput,
  ConfigFinanceiraOutput,
  EscolaInput,
  EscolaOutput,
} from '../model/configuracao.model';

@Injectable({ providedIn: 'root' })
export class ConfiguracaoService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  buscarEscola() {
    return this.http.get<EscolaOutput>(`${this.baseUrl}/escola`);
  }

  atualizarEscola(data: EscolaInput) {
    return this.http.put<EscolaOutput>(`${this.baseUrl}/escola`, data);
  }

  listarAnosLetivos(filtro?: AnoLetivoFiltro, page = 0, size = 10, sort = 'ano,desc') {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    if (filtro?.ano) params = params.set('ano', filtro.ano);

    return this.http.get<Page<AnoLetivoOutput>>(`${this.baseUrl}/anos-letivos`, { params });
  }

  buscarAnoLetivo(id: number) {
    return this.http.get<AnoLetivoOutput>(`${this.baseUrl}/anos-letivos/${id}`);
  }

  buscarAnoLetivoAtivo() {
    return this.http.get<AnoLetivoOutput | null>(`${this.baseUrl}/anos-letivos/ativo`);
  }

  criarAnoLetivo(data: AnoLetivoInput) {
    return this.http.post<AnoLetivoOutput>(`${this.baseUrl}/anos-letivos`, data);
  }

  ativarAnoLetivo(id: number) {
    return this.http.patch<AnoLetivoOutput>(`${this.baseUrl}/anos-letivos/${id}/ativar`, {});
  }

  prepararProximoAno(id: number) {
    return this.http.post<AnoLetivoOutput>(`${this.baseUrl}/anos-letivos/${id}/proximo-ano`, {});
  }

  listarConfigFinanceira(anoLetivoId: number, page = 0, size = 10, sort = 'vigenteAPartir,desc') {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    return this.http.get<Page<ConfigFinanceiraOutput>>(
      `${this.baseUrl}/anos-letivos/${anoLetivoId}/config-financeira`,
      { params }
    );
  }

  buscarConfigFinanceiraVigente(anoLetivoId: number) {
    return this.http.get<ConfigFinanceiraOutput | null>(
      `${this.baseUrl}/anos-letivos/${anoLetivoId}/config-financeira/vigente`
    );
  }

  criarConfigFinanceira(anoLetivoId: number, data: ConfigFinanceiraInput) {
    return this.http.post<ConfigFinanceiraOutput>(
      `${this.baseUrl}/anos-letivos/${anoLetivoId}/config-financeira`,
      data
    );
  }

  atualizarConfigFinanceira(anoLetivoId: number, id: number, data: ConfigFinanceiraInput) {
    return this.http.put<ConfigFinanceiraOutput>(
      `${this.baseUrl}/anos-letivos/${anoLetivoId}/config-financeira/${id}`,
      data
    );
  }
}
