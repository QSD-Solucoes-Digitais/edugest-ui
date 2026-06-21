import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Aluno, AlunoForm } from '../model/aluno.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AlunoRepository {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/alunos`;

  findAll() {
    return this.http.get<Aluno[]>(this.url);
  }

  findById(id: string) {
    return this.http.get<Aluno>(`${this.url}/${id}`);
  }

  create(data: AlunoForm) {
    return this.http.post<Aluno>(this.url, data);
  }

  update(id: string, data: Partial<AlunoForm>) {
    return this.http.put<Aluno>(`${this.url}/${id}`, data);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
