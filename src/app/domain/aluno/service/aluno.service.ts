import { Injectable, inject } from '@angular/core';
import { AlunoInput } from '../model/aluno.model';
import { AlunoRepository } from '../repository/aluno.repository';

@Injectable({ providedIn: 'root' })
export class AlunoService {
  private repo = inject(AlunoRepository);

  listar(page = 0, size = 10, sort = 'nome,asc', filters: Record<string, string> = {}) {
    return this.repo.findAll(page, size, sort, filters);
  }

  buscarPorId(id: number) {
    return this.repo.findById(id);
  }

  cadastrar(data: AlunoInput) {
    return this.repo.create(data);
  }

  atualizar(id: number, data: AlunoInput) {
    return this.repo.update(id, data);
  }

  inativar(id: number) {
    return this.repo.remove(id);
  }
}
