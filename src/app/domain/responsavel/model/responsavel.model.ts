import { EnderecoInput, EnderecoOutput } from './endereco.model';

export type StatusResponsavel = 'ATIVO' | 'INATIVO';

export interface ResponsavelOutput {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  status: StatusResponsavel;
  endereco: EnderecoOutput;
}

export interface ResponsavelInput {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  status: StatusResponsavel;
  endereco: EnderecoInput;
}
