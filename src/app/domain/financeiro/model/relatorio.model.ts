export interface ResumoFinanceiro {
  totalRecebido: number;
  totalPendente: number;
  totalVencido: number;
  totalAlunos: number;
  taxaInadimplencia: number;
}

export interface RelatorioMensal {
  mes: string;
  recebido: number;
  pendente: number;
  vencido: number;
}
