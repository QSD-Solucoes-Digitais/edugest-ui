import { Status } from '../../../core/models/status.model';
export type { Status };

export type GeneroAluno = 'MASCULINO' | 'FEMININO' | 'NAO_INFORMADO';

export interface AlunoOutput {
  id: number;
  nome: string;
  dataNascimento: string;
  cpf?: string;
  genero: GeneroAluno;
  matricula: string;
  responsavelId: number;
  responsavelNome?: string;
  status: Status;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface AlunoInput {
  nome: string;
  dataNascimento: string;
  cpf?: string;
  genero: GeneroAluno;
  responsavelId: number;
}
