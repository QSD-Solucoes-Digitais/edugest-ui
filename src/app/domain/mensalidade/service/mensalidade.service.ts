import { Injectable, inject } from '@angular/core';
import { MensalidadeForm } from '../model/mensalidade.model';
import { map } from 'rxjs';
import {MensalidadeRepository} from '../repository/mensalidade.repository';

@Injectable({ providedIn: 'root' })
export class MensalidadeService {
  private repo = inject(MensalidadeRepository);

  listar() {
    return this.repo.findAll();
  }

  listarPorAluno(alunoId: string) {
    return this.repo.findByAluno(alunoId);
  }

  listarVencidas() {
    return this.repo.findVencidas();
  }

  totalPorStatus() {
    return this.repo.findAll().pipe(
      map(items => ({
        pago:     items.filter(m => m.status === 'pago').reduce((s, m) => s + m.valor, 0),
        pendente: items.filter(m => m.status === 'pendente').reduce((s, m) => s + m.valor, 0),
        vencido:  items.filter(m => m.status === 'vencido').reduce((s, m) => s + m.valor, 0),
      }))
    );
  }

  gerar(data: MensalidadeForm) {
    return this.repo.create(data);
  }

  registrarPagamento(id: string) {
    return this.repo.registrarPagamento(id);
  }
}
