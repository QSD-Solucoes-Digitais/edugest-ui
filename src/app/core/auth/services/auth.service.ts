import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MSG } from '../../../shared/constants/messages';

export type PerfilUsuario = 'ADMIN' | 'SECRETARIA' | 'FINANCEIRO';

export interface UsuarioLogado {
  login: string;
  nome: string;
  perfil: PerfilUsuario;
  senhaProvisoria: boolean;
}

interface LoginResponse {
  token: string;
}

interface JwtPayload {
  sub: string;
  nome: string;
  perfil: PerfilUsuario;
  senhaProvisoria: boolean;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private messageService = inject(MessageService);

  private readonly TOKEN_KEY = 'edugest_token';
  private readonly url = `${environment.apiUrl}/autenticacao`;

  private _sessaoExpiradaNotificada = false;

  usuarioLogado$ = new BehaviorSubject<UsuarioLogado | null>(this.getPerfil());

  login(login: string, senha: string) {
    return this.http.post<LoginResponse>(`${this.url}/login`, { login, senha }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this._sessaoExpiradaNotificada = false;
        this.usuarioLogado$.next(this.getPerfil());
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.usuarioLogado$.next(null);
    this.router.navigate(['/login']);
  }

  encerrarSessao(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.usuarioLogado$.next(null);
  }

  logoutPorExpiracao(): void {
    if (this._sessaoExpiradaNotificada) return;
    this._sessaoExpiradaNotificada = true;
    this.messageService.add({
      severity: 'warn',
      summary: 'Sessão expirada',
      detail: MSG.auth.sessaoExpirada,
      life: 4000,
    });
    this.logout();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAutenticado(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const payload = this.decodePayload(token);
    if (!payload) return false;
    return payload.exp * 1000 > Date.now();
  }

  getPerfil(): UsuarioLogado | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.decodePayload(token);
    if (!payload) return null;
    return { login: payload.sub, nome: payload.nome, perfil: payload.perfil, senhaProvisoria: payload.senhaProvisoria ?? false };
  }

  recuperarSenha(email: string) {
    return this.http.post(`${this.url}/recuperar-senha`, { email });
  }

  alterarSenha(senhaAtual: string, novaSenha: string) {
    return this.http.post(`${this.url}/alterar-senha`, { senhaAtual, novaSenha });
  }

  senhaEhProvisoria(): boolean {
    return this.getPerfil()?.senhaProvisoria ?? false;
  }

  redefinirSenha(token: string, novaSenha: string) {
    return this.http.post(`${this.url}/redefinir-senha`, { token, novaSenha });
  }

  private decodePayload(token: string): JwtPayload | null {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64)) as JwtPayload;
    } catch {
      return null;
    }
  }
}