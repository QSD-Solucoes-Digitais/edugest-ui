import { EnderecoInput, EnderecoOutput } from './endereco.model';
import { Status } from '../../../core/models/status.model';
export type { Status };

export interface ResponsavelOutput {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  status: Status;
  endereco: EnderecoOutput;
}

export interface ResponsavelInput {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  status: Status;
  endereco: EnderecoInput;
}
