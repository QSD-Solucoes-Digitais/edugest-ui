import { PerfilUsuario } from '../../../core/auth/services/auth.service';

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface UsuarioInput {
  nome: string;
  login: string;
  perfil: PerfilUsuario;
  ativo?: boolean;
}

export interface UsuarioFiltro {
  perfil?: PerfilUsuario;
  ativo?: boolean;
}
