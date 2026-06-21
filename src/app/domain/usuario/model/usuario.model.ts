import { PerfilUsuario } from '../../../core/auth/services/auth.service';

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
}

export interface UsuarioInput {
  nome: string;
  login: string;
  email: string;
  perfil: PerfilUsuario;
  senha?: string;
}