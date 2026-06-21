import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponsavelInput, ResponsavelOutput } from '../model/responsavel.model';
import { Page } from '../../../core/models/page.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResponsavelRepository {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/responsaveis`;

  findAll(page = 0, size = 10, sort = 'nome,asc', filters: Record<string, string> = {}) {
    const params: Record<string, any> = { page, size, sort };
    for (const [key, value] of Object.entries(filters)) {
      if (value) params[key] = value;
    }
    return this.http.get<Page<ResponsavelOutput>>(this.url, { params });
  }

  findById(id: number) {
    return this.http.get<ResponsavelOutput>(`${this.url}/${id}`);
  }

  create(data: ResponsavelInput) {
    return this.http.post<ResponsavelOutput>(this.url, data);
  }

  update(id: number, data: ResponsavelInput) {
    return this.http.put<ResponsavelOutput>(`${this.url}/${id}`, data);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
