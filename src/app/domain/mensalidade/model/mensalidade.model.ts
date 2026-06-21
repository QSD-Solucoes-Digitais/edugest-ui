export type StatusMensalidade = 'pago' | 'pendente' | 'vencido';

export interface Mensalidade {
  id: string;
  alunoId: string;
  alunoNome: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: StatusMensalidade;
  planoId: string;
  pixTxid?: string;
}

export interface MensalidadeForm {
  alunoId: string;
  valor: number;
  dataVencimento: string;
  planoId: string;
}
