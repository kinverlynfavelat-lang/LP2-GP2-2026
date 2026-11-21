import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';
import { RolUsuario } from '../interfaces/auth.interface';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const alertService = inject(AlertService);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const rolesPermitidos = route.data?.['roles'] as RolUsuario[] | undefined;

  if (rolesPermitidos && rolesPermitidos.length > 0 && !authService.hasRole(rolesPermitidos)) {
    alertService.error('No tienes permisos para acceder a este módulo.');
    return router.createUrlTree(['/home']);
  }

  return true;
};
