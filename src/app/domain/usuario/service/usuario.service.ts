import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Usuario, UsuarioInput, UsuarioFiltro } from '../model/usuario.model';
import { Page } from '../../../core/models/page.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  listar(filtro?: UsuarioFiltro, page = 0, size = 10, sort = 'nome,asc') {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    if (filtro?.nome)   params = params.set('nome', filtro.nome);
    if (filtro?.perfil) params = params.set('perfil', filtro.perfil);
    if (filtro?.ativo !== undefined) params = params.set('ativo', String(filtro.ativo));

    return this.http.get<Page<Usuario>>(this.url, { params });
  }

  buscarPorId(id: number) {
    return this.http.get<Usuario>(`${this.url}/${id}`);
  }

  criar(data: UsuarioInput) {
    return this.http.post<Usuario>(this.url, data);
  }

  atualizar(id: number, data: UsuarioInput) {
    return this.http.put<Usuario>(`${this.url}/${id}`, data);
  }

  inativar(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
