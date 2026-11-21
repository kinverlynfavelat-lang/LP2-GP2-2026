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
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  onSubmit(): void {
    if (!this.credentials.usuario.trim() || !this.credentials.password) {
      this.alertService.error('Ingresa tu usuario y contraseña.');
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
          this.alertService.success('Bienvenido al Centro Médico UPeU');
        } else {
          this.alertService.error('Usuario o contraseña incorrectos.');
        }
      },
      error: () => {
        this.cargando = false;
        this.alertService.error('No se pudo conectar con el servidor.');
      }
    });
  }
}
