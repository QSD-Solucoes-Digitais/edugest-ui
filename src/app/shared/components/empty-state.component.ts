import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <i [class]="'pi ' + icon()"></i>
      <p class="empty-title">{{ title() }}</p>
      <p class="empty-subtitle">{{ subtitle() }}</p>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 0.5rem;
      color: #94a3b8;

      i { font-size: 2.5rem; margin-bottom: 0.5rem; }
      .empty-title { font-size: 1rem; font-weight: 500; color: #64748b; margin: 0; }
      .empty-subtitle { font-size: 0.875rem; margin: 0; }
    }
  `],
})
export class EmptyStateComponent {
  icon  = input('pi-inbox');
  title = input('Nenhum item encontrado');
  subtitle = input('Tente ajustar os filtros ou adicione um novo registro.');
}
