import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AlunoInput, AlunoOutput } from '../model/aluno.model';
import { Page } from '../../../core/models/page.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AlunoRepository {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/alunos`;

  findAll(page = 0, size = 10, sort = 'nome,asc', filters: Record<string, string> = {}) {
    const params: Record<string, any> = { page, size, sort };
    for (const [key, value] of Object.entries(filters)) {
      if (value) params[key] = value;
    }
    return this.http.get<Page<AlunoOutput>>(this.url, { params });
  }

  findById(id: number) {
    return this.http.get<AlunoOutput>(`${this.url}/${id}`);
  }

  create(data: AlunoInput) {
    return this.http.post<AlunoOutput>(this.url, data);
  }

  update(id: number, data: AlunoInput) {
    return this.http.put<AlunoOutput>(`${this.url}/${id}`, data);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
