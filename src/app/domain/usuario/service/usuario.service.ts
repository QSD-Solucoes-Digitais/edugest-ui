import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Usuario, UsuarioInput } from '../model/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  listar() {
    return this.http.get<Usuario[]>(this.url);
  }

  buscarPorId(id: number) {
    return this.http.get<Usuario>(`${this.url}/${id}`);
  }

  cadastrar(data: UsuarioInput) {
    return this.http.post<Usuario>(this.url, data);
  }

  atualizar(id: number, data: Partial<UsuarioInput>) {
    return this.http.put<Usuario>(`${this.url}/${id}`, data);
  }

  excluir(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}