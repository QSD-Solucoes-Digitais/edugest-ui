import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Notificacao } from '../model/notificacao.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/notificacoes`;

  historico() {
    return this.http.get<Notificacao[]>(this.url);
  }

  enviarCobranca(alunoId: string, canal: 'whatsapp' | 'email') {
    return this.http.post<Notificacao>(`${this.url}/cobranca`, { alunoId, canal });
  }
}
