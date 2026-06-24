import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { MSG } from '../../../shared/constants/messages';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError(error => {
      const status: number = error?.status;

      // Rotas de autenticação: componente trata o erro diretamente (sem toast, redirect ou logout)
      if (req.url.includes('/autenticacao/')) {
        return throwError(() => error);
      }

      if (status === 401) {
        auth.logoutPorExpiracao();
        return throwError(() => error);
      }

      if (status === 403) {
        router.navigate(['/403']);
        return throwError(() => error);
      }

      const detail =
        status === 500
          ? MSG.sistema.erroInterno
          : (error?.error?.title ?? MSG.sistema.erroInesperado);

      messageService.add({ severity: 'error', summary: 'Erro', detail });
      return throwError(() => error);
    })
  );
};