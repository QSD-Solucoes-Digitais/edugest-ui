export interface Aluno {
  id: string;
  nome: string;
  turma: string;
  responsavel: string;
  telefone: string;
  email: string;
  ativo: boolean;
  dataCadastro: string;
}

export interface AlunoForm {
  nome: string;
  turma: string;
  responsavel: string;
  telefone: string;
  email: string;
}
