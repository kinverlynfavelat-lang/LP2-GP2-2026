
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

import { EmpleadoService } from '../../../core/services/empleado.service';
import { PersonaService } from '../../../core/services/persona.service';
import { AlertService } from '../../../core/services/alert.service';

interface EmpleadoVista {
  idPersona: number;
  dni: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  fechaIngreso: string;
  sueldo: number;
  estado: string;
}

@Component({
  selector: 'app-empleado-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './empleado-list.component.html',
  styleUrl: './empleado-list.component.css'
})
export class EmpleadoListComponent implements OnInit {

  private empleadoService = inject(EmpleadoService);
  private personaService = inject(PersonaService);
  private alertService = inject(AlertService);
  private http = inject(HttpClient);

  // Endpoint del registro protegido para ADMIN
  private readonly registroUrl =
    'http://localhost:8080/centro-medico/api/v1/auth/registro';

  empleados: EmpleadoVista[] = [];
  empleadosFiltrados: EmpleadoVista[] = [];

  busqueda: string = '';
  cargando: boolean = false;
  errorCarga: boolean = false;
  creandoAcceso: boolean = false;

  ngOnInit(): void {
    this.listEmpleados();
  }

  // ==========================================
  // LISTAR EMPLEADOS
  // ==========================================

  listEmpleados(): void {

    this.cargando = true;
    this.errorCarga = false;

    forkJoin({
      personas: this.personaService.getPersonas(),
      empleados: this.empleadoService.getEmpleados()
    }).subscribe({

      next: (data) => {

        const resultado: EmpleadoVista[] = [];

        for (const empleado of data.empleados) {

          if (empleado.idPersona == null) {
            continue;
          }

          const persona = data.personas.find(p =>
            p.idPersona === empleado.idPersona &&
            p.tipoPersona === 'EMPLEADO'
          );

          if (persona) {

            resultado.push({
              idPersona: empleado.idPersona,
              dni: persona.dni,
              nombres: persona.nombres,
              apellidos: persona.apellidos,
              correo: persona.correo,
              telefono: persona.telefono,
              fechaIngreso: empleado.fechaIngreso,
              sueldo: empleado.sueldo,
              estado: persona.estado
            });

          }
        }

        this.empleados = resultado;
        this.filtrarEmpleados();
        this.cargando = false;

      },

      error: (err) => {

        console.error('Error al cargar empleados:', err);

        this.errorCarga = true;
        this.cargando = false;

        this.alertService.error(
          'No se pudieron cargar los empleados'
        );

      }

    });
  }

  // ==========================================
  // BUSCAR EMPLEADOS
  // ==========================================

  filtrarEmpleados(): void {

    const texto = this.busqueda.trim().toLowerCase();

    if (!texto) {
      this.empleadosFiltrados = [...this.empleados];
      return;
    }

    this.empleadosFiltrados = this.empleados.filter(e => {

      const dni = (e.dni || '').toLowerCase();
      const nombres = (e.nombres || '').toLowerCase();
      const apellidos = (e.apellidos || '').toLowerCase();

      const nombreCompleto =
        `${nombres} ${apellidos}`.trim();

      return (
        dni.includes(texto) ||
        nombres.includes(texto) ||
        apellidos.includes(texto) ||
        nombreCompleto.includes(texto)
      );

    });
  }

  // ==========================================
  // CREAR ACCESO PARA UN TRABAJADOR
  // ==========================================

  async crearAcceso(e: EmpleadoVista): Promise<void> {

    if (this.creandoAcceso) {
      return;
    }

    if (e.estado !== 'ACTIVO') {

      await Swal.fire({
        icon: 'warning',
        title: 'Empleado inactivo',
        text: 'Solo se pueden crear accesos para empleados activos.',
        confirmButtonColor: '#07577A'
      });

      return;
    }

    const resultado = await Swal.fire({

      title: 'Crear acceso al sistema',

      html: `
        <div class="text-start">

          <div class="rounded p-3 mb-3"
               style="background:#E8F5FB;">

            <small class="text-muted d-block">
              Empleado seleccionado
            </small>

            <strong id="nombreEmpleadoAcceso"
                    style="color:#07577A;">
            </strong>

          </div>

          <label class="form-label fw-semibold">
            Usuario
          </label>

          <input
            id="accesoUsuario"
            type="text"
            class="form-control mb-3"
            placeholder="Ejemplo: carlos.ramirez"
            autocomplete="off">

          <label class="form-label fw-semibold">
            Contraseña inicial
          </label>

          <input
            id="accesoPassword"
            type="password"
            class="form-control mb-3"
            placeholder="Mínimo 12 caracteres"
            autocomplete="new-password">

          <label class="form-label fw-semibold">
            Confirmar contraseña
          </label>

          <input
            id="accesoConfirmacion"
            type="password"
            class="form-control mb-3"
            placeholder="Repetir contraseña"
            autocomplete="new-password">

          <label class="form-label fw-semibold">
            Área de acceso
          </label>

          
<label class="form-label fw-semibold">
  Rol de acceso
</label>

<select
  id="accesoRol"
  class="form-select">

  <option value="">
    Seleccionar rol...
  </option>

  <option value="ADMIN">
    Administrador
  </option>

  <option value="MEDICO">
    Médico
  </option>

  <option value="TRIAJE">
    Personal de triaje
  </option>

  <option value="FARMACIA">
    Personal de farmacia
  </option>

</select>

<small class="text-muted d-block mt-2">
  El administrador asigna el rol según
  las funciones del trabajador.
</small>


          <small class="text-muted d-block mt-3">
            La cuenta se vinculará automáticamente
            con la persona seleccionada.
            La contraseña se protegerá con BCrypt.
          </small>

        </div>
      `,

      didOpen: () => {

        const nombre = Swal.getPopup()
          ?.querySelector<HTMLElement>(
            '#nombreEmpleadoAcceso'
          );

        if (nombre) {
          nombre.textContent =
            `${e.nombres} ${e.apellidos}`;
        }

      },

      showCancelButton: true,
      confirmButtonText: 'Crear acceso',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#07577A',
      cancelButtonColor: '#718096',
      focusConfirm: false,

      preConfirm: () => {

        const popup = Swal.getPopup();

        const usuario = popup
          ?.querySelector<HTMLInputElement>(
            '#accesoUsuario'
          )
          ?.value.trim() || '';

        const password = popup
          ?.querySelector<HTMLInputElement>(
            '#accesoPassword'
          )
          ?.value || '';

        const confirmacion = popup
          ?.querySelector<HTMLInputElement>(
            '#accesoConfirmacion'
          )
          ?.value || '';

        const rol = popup
          ?.querySelector<HTMLSelectElement>(
            '#accesoRol'
          )
          ?.value || '';

        if (!usuario || usuario.length < 3) {

          Swal.showValidationMessage(
            'El usuario debe tener al menos 3 caracteres.'
          );

          return false;
        }

        if (password.length < 7) {

          Swal.showValidationMessage(
            'La contraseña debe tener al menos 7 caracteres.'
          );

          return false;
        }

        if (password !== confirmacion) {

          Swal.showValidationMessage(
            'Las contraseñas no coinciden.'
          );

          return false;
        }

        if (!rol) {

          Swal.showValidationMessage(
            'Selecciona el área del trabajador.'
          );

          return false;
        }

        return {
          usuario,
          password,
          rol,
          idPersona: e.idPersona
        };

      }

    });

    if (!resultado.isConfirmed || !resultado.value) {
      return;
    }

    // El servicio del backend:
    // - Vincula la PERSONA existente.
    // - Comprueba duplicados.
    // - Guarda la contraseña con BCrypt.
    // - Asigna el rol del trabajador.

    this.creandoAcceso = true;

    this.http.post(
      this.registroUrl,
      resultado.value
    ).subscribe({

      next: () => {

        this.creandoAcceso = false;

        Swal.fire({
          icon: 'success',
          title: 'Acceso creado',
          text: 'El trabajador ya puede iniciar sesión con su usuario y contraseña.',
          confirmButtonColor: '#07577A'
        });

      },

      error: (err: HttpErrorResponse) => {

        this.creandoAcceso = false;

        let mensaje = 'No se pudo crear el acceso.';

        if (err.status === 401) {

          mensaje =
            'Tu sesión ha expirado o no se envió el token JWT. Inicia sesión nuevamente.';

        } else if (err.status === 403) {

          mensaje =
            'No tienes permiso para registrar usuarios. Verifica tu sesión de administrador.';

        } else if (err.status === 409) {

          mensaje =
            'El usuario ya existe o esta persona ya tiene una cuenta asignada.';

        } else if (err.status === 400) {

          mensaje =
            'Revisa los datos enviados. El servidor rechazó el registro.';

        } else if (
          typeof err.error?.message === 'string'
        ) {

          mensaje = err.error.message;

        }

        Swal.fire({
          icon: 'error',
          title: 'No se pudo crear el acceso',
          text: mensaje,
          confirmButtonColor: '#07577A'
        });

      }

    });

  }

  // ==========================================
  // FORMATEAR FECHA
  // ==========================================

  formatearFecha(
    fecha: string | null | undefined
  ): string {

    if (!fecha) {
      return '-';
    }

    const partes = fecha.substring(0, 10).split('-');

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

}
