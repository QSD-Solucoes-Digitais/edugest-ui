import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

interface RecentPayment {
  student: string;
  amount: number;
  dueDate: string;
  status: 'pago' | 'pendente' | 'vencido';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    ButtonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  stats = [
    {
      label: 'Total recebido',
      value: 'R$ 24.800',
      icon: 'pi pi-check-circle',
      color: 'green',
      sub: '31 pagamentos',
    },
    {
      label: 'Pendentes',
      value: 'R$ 6.400',
      icon: 'pi pi-clock',
      color: 'yellow',
      sub: '8 alunos',
    },
    {
      label: 'Vencidos',
      value: 'R$ 3.200',
      icon: 'pi pi-exclamation-circle',
      color: 'red',
      sub: '4 alunos',
    },
    {
      label: 'Total de alunos',
      value: '43',
      icon: 'pi pi-users',
      color: 'blue',
      sub: '3 turmas',
    },
  ];

  recentPayments: RecentPayment[] = [
    { student: 'Ana Paula Silva',     amount: 480, dueDate: '10/06/2026', status: 'pago' },
    { student: 'Carlos Eduardo Lima', amount: 480, dueDate: '10/06/2026', status: 'pago' },
    { student: 'Mariana Costa',       amount: 480, dueDate: '05/06/2026', status: 'vencido' },
    { student: 'João Pedro Souza',    amount: 480, dueDate: '15/06/2026', status: 'pendente' },
    { student: 'Beatriz Ferreira',    amount: 480, dueDate: '10/06/2026', status: 'pago' },
  ];

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
    const map: Record<string, 'success' | 'warn' | 'danger'> = {
      pago: 'success',
      pendente: 'warn',
      vencido: 'danger',
    };
    return map[status];
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pago: 'Pago',
      pendente: 'Pendente',
      vencido: 'Vencido',
    };
    return map[status];
  }
}
