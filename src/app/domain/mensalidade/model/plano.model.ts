export interface Plano {
  id: string;
  nome: string;
  valor: number;
  diaVencimento: number;
  descricao?: string;
  ativo: boolean;
}
