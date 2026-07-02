export type TipoPeriodoLetivo = 'ANUAL' | 'SEMESTRAL' | 'BIMESTRAL' | 'TRIMESTRAL';
export type StatusAnoLetivo = 'ATIVO' | 'CONCLUIDO' | 'PLANEJADO';

export interface EnderecoInput {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface EnderecoOutput {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface EscolaOutput {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: EnderecoOutput;
}

export interface EscolaInput {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: EnderecoInput;
}

export interface AnoLetivoOutput {
  id: number;
  ano: number;
  tipoPeriodo: TipoPeriodoLetivo;
  dataInicio: string;
  dataTermino: string;
  numeroParcelas: number;
  status: StatusAnoLetivo;
  configFinanceiraVigente?: ConfigFinanceiraOutput;
}

export interface AnoLetivoInput {
  ano: number;
  tipoPeriodo: TipoPeriodoLetivo;
  dataInicio: string;
  dataTermino: string;
  numeroParcelas: number;
}

export interface AnoLetivoFiltro {
  ano?: number;
}

export interface ConfigFinanceiraOutput {
  id: number;
  vigenteAPartir: string;
  diaVencimento: number;
  taxaMatricula?: number;
  multaValorFixo?: number;
  multaPercentual?: number;
  jurosPercentualMes?: number;
}

export interface ConfigFinanceiraInput {
  diaVencimento: number;
  taxaMatricula?: number;
  multaValorFixo?: number;
  multaPercentual?: number;
  jurosPercentualMes?: number;
  vigenciaImediata?: boolean; // apenas na criação — ignorado na edição
}
