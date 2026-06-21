import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError(error => {
      const msg = error?.error?.message ?? 'Ocorreu um erro inesperado. Tente novamente.';
      messageService.add({ severity: 'error', summary: 'Erro', detail: msg });
      return throwError(() => error);
    })
  );
};
