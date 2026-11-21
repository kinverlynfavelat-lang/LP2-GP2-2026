import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { ILoginRequest, ILoginResponse, RolUsuario } from '../interfaces/auth.interface';
import { CatalogCacheService } from '../offline/catalog-cache.service';

const TOKEN_KEY = 'token_centro_medico';
const USER_KEY = 'cm_user_name';
const ROLE_KEY = 'cm_user_role';
const ID_KEY = 'cm_user_id';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);
  private catalogCache = inject(CatalogCacheService);

  private apiUrl = '/api/v1/auth';

  private loggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem(TOKEN_KEY));
  readonly isLoggedIn$ = this.loggedInSubject.asObservable();

  readonly isAuthenticated = signal<boolean>(!!localStorage.getItem(TOKEN_KEY));
  readonly currentUser = signal<string | null>(localStorage.getItem(USER_KEY));
  readonly currentRole = signal<RolUsuario | null>(localStorage.getItem(ROLE_KEY) as RolUsuario | null);

  login(credentials: ILoginRequest): Observable<boolean> {
    return this.http.post<ILoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem(TOKEN_KEY, response.token);
          localStorage.setItem(USER_KEY, response.usuario);
          localStorage.setItem(ROLE_KEY, response.rol);
          localStorage.setItem(ID_KEY, String(response.idUsuario));

          this.loggedInSubject.next(true);
          this.isAuthenticated.set(true);
          this.currentUser.set(response.usuario);
          this.currentRole.set(response.rol);

          // Precargar catálogos offline una vez autenticado
          this.catalogCache.sincronizarCatalogos();

          this.router.navigate(['/home']);
        }
      }),
      map(response => !!response?.token),
      catchError(() => of(false))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(ID_KEY);

    this.loggedInSubject.next(false);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.currentRole.set(null);

    this.router.navigate(['/portal-paciente']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRol(): RolUsuario | null {
    return localStorage.getItem(ROLE_KEY) as RolUsuario | null;
  }

  getUsuario(): string | null {
    return localStorage.getItem(USER_KEY);
  }

  hasRole(roles: RolUsuario[]): boolean {
    const rol = this.getRol();
    if (!rol) return false;
    return roles.includes(rol);
  }
}
