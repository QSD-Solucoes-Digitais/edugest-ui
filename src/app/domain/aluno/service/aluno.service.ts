import { Injectable, inject } from '@angular/core';
import { AlunoForm } from '../model/aluno.model';
import { map } from 'rxjs';
import {AlunoRepository} from '../repository/aluno.repository';

@Injectable({ providedIn: 'root' })
export class AlunoService {
  private repo = inject(AlunoRepository);

  listar() {
    return this.repo.findAll();
  }

  listarAtivos() {
    return this.repo.findAll().pipe(
      map(alunos => alunos.filter(a => a.ativo))
    );
  }

  buscarPorId(id: string) {
    return this.repo.findById(id);
  }

  cadastrar(data: AlunoForm) {
    return this.repo.create(data);
  }

  atualizar(id: string, data: Partial<AlunoForm>) {
    return this.repo.update(id, data);
  }

  remover(id: string) {
    return this.repo.remove(id);
  }
}
