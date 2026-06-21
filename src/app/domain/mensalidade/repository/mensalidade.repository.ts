import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Mensalidade, MensalidadeForm } from '../model/mensalidade.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MensalidadeRepository {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/mensalidades`;

  findAll() {
    return this.http.get<Mensalidade[]>(this.url);
  }

  findByAluno(alunoId: string) {
    return this.http.get<Mensalidade[]>(`${this.url}?alunoId=${alunoId}`);
  }

  findVencidas() {
    return this.http.get<Mensalidade[]>(`${this.url}?status=vencido`);
  }

  create(data: MensalidadeForm) {
    return this.http.post<Mensalidade>(this.url, data);
  }

  registrarPagamento(id: string) {
    return this.http.patch<Mensalidade>(`${this.url}/${id}/pagar`, {});
  }
}
