import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-erro-403',
  standalone: true,
  imports: [RouterModule, ButtonModule],
  template: `
    <div class="error-page">
      <i class="pi pi-lock error-icon"></i>
      <h1>Acesso negado</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <p-button
        label="Voltar ao Dashboard"
        icon="pi pi-home"
        routerLink="/dashboard"
      />
    </div>
  `,
  styles: [`
    .error-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 1rem;
      text-align: center;
      padding: 2rem;
      background: var(--p-surface-50);
    }

    .error-icon {
      font-size: 5rem;
      color: var(--p-surface-300);
    }

    h1 {
      font-size: 2rem;
      color: var(--p-surface-700);
    }

    p {
      color: var(--p-surface-500);
      max-width: 400px;
    }
  `],
})
export class Erro403Component {}