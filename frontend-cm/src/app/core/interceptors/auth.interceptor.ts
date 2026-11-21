import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const alertService = inject(AlertService);

  const token = authService.getToken();
  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError(error => {
      const urlActual = router.url;
      const esRutaPublica =
        urlActual.startsWith('/login') ||
        urlActual.startsWith('/portal-paciente');

      if (error.status === 401 && !esRutaPublica) {
        authService.logout();
      } else if (error.status === 403) {
        alertService.error('No tienes permisos para realizar esta acción.');
      }

      return throwError(() => error);
    })
  );
};
