
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  credentials = {
    usuario: '',
    password: ''
  };

  cargando = false;
  mostrarPassword = false;

  constructor() {

    // Si el trabajador ya inicio sesion,
    // llevarlo directamente a su modulo.

    if (this.authService.isLoggedIn()) {

      const ruta = this.obtenerRutaPorRol();

      if (ruta) {
        this.router.navigateByUrl(ruta);
      }
    }
  }

  // ==========================================
  // OBTENER RUTA SEGUN EL ROL
  // ==========================================

  private obtenerRutaPorRol(): string | null {

    const rol = String(
      this.authService.currentRole() ?? ''
    ).trim().toUpperCase();

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
        return null;
    }
  }

  // ==========================================
  // INICIAR SESION
  // ==========================================

  onSubmit(): void {

    if (
      !this.credentials.usuario.trim() ||
      !this.credentials.password
    ) {

      this.alertService.error(
        'Ingresa tu usuario y contraseña.'
      );

      return;
    }

    this.cargando = true;

    this.authService.login({
      usuario: this.credentials.usuario.trim(),
      password: this.credentials.password
    }).subscribe({

      next: (success) => {

        this.cargando = false;

        if (success) {

          const ruta = this.obtenerRutaPorRol();

          if (!ruta) {

            this.alertService.error(
              'No se pudo identificar el rol del trabajador.'
            );

            return;
          }

          this.alertService.success(
            'Bienvenido al Centro Médico UPeU'
          );

          // Cada trabajador ingresa directamente
          // al modulo correspondiente a su rol.

          this.router.navigateByUrl(ruta);

        } else {

          this.alertService.error(
            'Usuario o contraseña incorrectos.'
          );
        }
      },

      error: () => {

        this.cargando = false;

        this.alertService.error(
          'No se pudo conectar con el servidor.'
        );
      }

    });
  }
}
