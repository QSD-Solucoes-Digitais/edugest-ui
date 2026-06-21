import { Component } from '@angular/core';

@Component({
  selector: 'app-aluno-list',
  standalone: true,
  template: `
    <div class="flex flex-column align-items-center justify-content-center" style="padding: 4rem; gap: 1rem;">
      <i class="pi pi-users" style="font-size: 3rem; color: var(--p-surface-300)"></i>
      <h2 style="color: var(--p-surface-500)">Alunos</h2>
      <p style="color: var(--p-surface-400)">Módulo em construção — disponível na Sprint 3.</p>
    </div>
  `,
})
export class AlunoListComponent {}