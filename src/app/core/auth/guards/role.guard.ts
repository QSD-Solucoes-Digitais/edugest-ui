import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService, PerfilUsuario } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const perfisPermitidos = (route.data['perfis'] ?? []) as PerfilUsuario[];
  const perfilAtual = auth.getPerfil()?.perfil;

  if (!perfilAtual || !perfisPermitidos.includes(perfilAtual)) {
    router.navigate(['/403']);
    return false;
  }

  return true;
};