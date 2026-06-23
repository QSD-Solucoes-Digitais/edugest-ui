import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';

const ROTAS_PUBLICAS = [
  '/autenticacao/login',
  '/autenticacao/recuperar-senha',
  '/autenticacao/redefinir-senha',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const ehRotaPublica = ROTAS_PUBLICAS.some(rota => req.url.includes(rota));

  if (ehRotaPublica) {
    return next(req);
  }

  const auth = inject(AuthService);
  const token = auth.getToken();

  if (token) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }

  return next(req);
};
