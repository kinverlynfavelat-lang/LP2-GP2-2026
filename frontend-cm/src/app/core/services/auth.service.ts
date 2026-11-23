
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  tap
} from 'rxjs';

import {
  ILoginRequest,
  ILoginResponse,
  RolUsuario
} from '../interfaces/auth.interface';

const TOKEN_KEY = 'token_centro_medico';
const USER_KEY = 'cm_user_name';
const ROLE_KEY = 'cm_user_role';
const ID_KEY = 'cm_user_id';
const PERSONA_ID_KEY = 'cm_user_id_persona';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = '/api/v1/auth';

  private loggedInSubject =
    new BehaviorSubject<boolean>(
      !!localStorage.getItem(TOKEN_KEY)
    );

  readonly isLoggedIn$ =
    this.loggedInSubject.asObservable();

  readonly isAuthenticated = signal<boolean>(
    !!localStorage.getItem(TOKEN_KEY)
  );

  readonly currentUser = signal<string | null>(
    localStorage.getItem(USER_KEY)
  );

  readonly currentRole = signal<RolUsuario | null>(
    localStorage.getItem(ROLE_KEY) as RolUsuario | null
  );

  // ==========================================
  // INICIAR SESION
  // ==========================================

  login(credentials: ILoginRequest): Observable<boolean> {

    return this.http
      .post<ILoginResponse>(
        `${this.apiUrl}/login`,
        credentials
      )
      .pipe(

        tap(response => {

          if (response && response.token) {

            // Guardar JWT
            localStorage.setItem(
              TOKEN_KEY,
              response.token
            );

            // Guardar usuario
            localStorage.setItem(
              USER_KEY,
              response.usuario
            );

            // Guardar rol
            localStorage.setItem(
              ROLE_KEY,
              response.rol
            );

            // Guardar ID del usuario
            localStorage.setItem(
              ID_KEY,
              String(response.idUsuario)
            );

            // Guardar ID de persona
            if (response.idPersona != null) {

              localStorage.setItem(
                PERSONA_ID_KEY,
                String(response.idPersona)
              );

            } else {

              localStorage.removeItem(
                PERSONA_ID_KEY
              );
            }

            // Actualizar estado de autenticacion
            this.loggedInSubject.next(true);

            this.isAuthenticated.set(true);

            this.currentUser.set(
              response.usuario
            );

            this.currentRole.set(
              response.rol
            );

            // No sincronizar todos los catalogos
            // automaticamente durante el login.
            // Cada rol tiene permisos diferentes.
            // La sincronizacion offline se gestiona
            // desde su modulo correspondiente.

            // Redirigir al inicio
            this.router.navigate(['/home']);

          }

        }),

        map(response => !!response?.token),

        catchError(() => of(false))

      );
  }

  // ==========================================
  // CERRAR SESION
  // ==========================================

  logout(): void {

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(ID_KEY);
    localStorage.removeItem(PERSONA_ID_KEY);

    this.loggedInSubject.next(false);

    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.currentRole.set(null);

    this.router.navigate(['/portal-paciente']);
  }

  // ==========================================
  // OBTENER TOKEN
  // ==========================================

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // ==========================================
  // VERIFICAR SESION
  // ==========================================

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ==========================================
  // OBTENER ROL
  // ==========================================

  getRol(): RolUsuario | null {
    return localStorage.getItem(ROLE_KEY) as RolUsuario | null;
  }

  // ==========================================
  // OBTENER USUARIO
  // ==========================================

  getUsuario(): string | null {
    return localStorage.getItem(USER_KEY);
  }

  // ==========================================
  // VERIFICAR PERMISOS
  // ==========================================

  hasRole(roles: RolUsuario[]): boolean {

    const rol = this.getRol();

    if (!rol) {
      return false;
    }

    return roles.includes(rol);
  }

}
