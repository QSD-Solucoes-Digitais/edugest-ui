import { Injectable, inject } from '@angular/core';
import {ResponsavelRepository} from '../repository/responsavel.repository';
import { ResponsavelInput } from '../model/responsavel.model';

@Injectable({ providedIn: 'root' })
export class ResponsavelService {
  private repo = inject(ResponsavelRepository);

  listar(page = 0, size = 10, sort = 'nome,asc', filters: Record<string, string> = {}) {
    return this.repo.findAll(page, size, sort, filters);
  }

  buscarPorId(id: number) {
    return this.repo.findById(id);
  }

  cadastrar(data: ResponsavelInput) {
    return this.repo.create(data);
  }

  atualizar(id: number, data: ResponsavelInput) {
    return this.repo.update(id, data);
  }

  excluir(id: number) {
    return this.repo.remove(id);
  }
}
