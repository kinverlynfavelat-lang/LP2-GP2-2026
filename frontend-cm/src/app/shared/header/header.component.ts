
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { SyncService } from '../../core/offline/sync.service';
import { NetworkService } from '../../core/offline/network.service';
import { AuthService } from '../../core/services/auth.service';
import { RolUsuario } from '../../core/interfaces/auth.interface';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  readonly network = inject(NetworkService);
  readonly sync = inject(SyncService);
  readonly auth = inject(AuthService);

  // ==========================================
  // PERMISOS SEGUN ROL
  // ==========================================

  puedeVer(roles: RolUsuario[]): boolean {
    return this.auth.hasRole(roles);
  }

  // ==========================================
  // DESTINO DEL LOGO UPEU SALUD
  // ==========================================

  get rutaLogo(): string {

    if (!this.auth.isAuthenticated()) {
      return '/inicio';
    }

    const rol = this.auth.currentRole();

    switch (rol) {

      case 'ADMIN':
        return '/citas';

      case 'MEDICO':
        return '/atencion';

      case 'TRIAJE':
        return '/triaje';

      case 'FARMACIA':
        return '/farmacia';

      default:
        return '/login';
    }
  }

  // ==========================================
  // CERRAR SESION
  // ==========================================

  cerrarSesion(): void {
    this.auth.logout();
  }

}
