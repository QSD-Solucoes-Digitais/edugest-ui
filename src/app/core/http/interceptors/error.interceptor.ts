import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError(error => {
      const status: number = error?.status;

      if (status === 401) {
        auth.logout();
        return throwError(() => error);
      }

      if (status === 403) {
        router.navigate(['/acesso-negado']);
        return throwError(() => error);
      }

      const detail =
        status === 500
          ? 'Erro interno do servidor. Tente novamente mais tarde.'
          : (error?.error?.message ?? 'Ocorreu um erro inesperado. Tente novamente.');

      messageService.add({ severity: 'error', summary: 'Erro', detail });
      return throwError(() => error);
    })
  );
};