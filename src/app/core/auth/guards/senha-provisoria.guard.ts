import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const senhaProvisoriaChildGuard: CanActivateChildFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.senhaEhProvisoria()) {
    router.navigate(['/alterar-senha']);
    return false;
  }

  return true;
};
