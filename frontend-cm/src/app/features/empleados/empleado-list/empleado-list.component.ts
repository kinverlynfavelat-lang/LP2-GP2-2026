
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
  rol: string | null;
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
              estado: persona.estado,
              rol: empleado.rol ?? null
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
        confirmButtonColor: '#075878'
      });

      return;
    }

    const resultado = await Swal.fire({

      title: 'Crear acceso al sistema',
      width: 520,
      padding: '25px 26px 22px',
      background: '#ffffff',
      color: '#24485e',

      html: `
        <div style="text-align:left; font-size:14px; color:#24485e;">

          <!-- EMPLEADO SELECCIONADO -->
          <div style="
            background:#EAF6FB;
            border:1px solid #D3EAF3;
            border-radius:12px;
            padding:14px 16px;
            margin-bottom:21px;
          ">
            <div style="
              font-size:11px;
              font-weight:700;
              letter-spacing:0.6px;
              color:#5F8195;
              margin-bottom:5px;
            ">
              EMPLEADO SELECCIONADO
            </div>
            <strong id="nombreEmpleadoAcceso"
                    style="color:#075878; font-size:15px;">
            </strong>
          </div>

          <!-- USUARIO -->
          <div style="margin-bottom:15px;">
            <label for="accesoUsuario" style="
              display:block;
              margin-bottom:7px;
              font-size:13px;
              font-weight:600;
            ">
              Nombre de usuario
            </label>
            <input
              id="accesoUsuario"
              type="text"
              class="form-control"
              style="height:43px; border-radius:8px; font-size:14px;"
              placeholder="Ej. carlos.ramirez"
              autocomplete="off"
              maxlength="80">
          </div>

          <!-- CONTRASEÑA INICIAL -->
          <div style="margin-bottom:15px;">
            <label for="accesoPassword" style="
              display:block;
              margin-bottom:7px;
              font-size:13px;
              font-weight:600;
            ">
              Contraseña inicial
            </label>
            <div class="input-group">
              <input
                id="accesoPassword"
                type="password"
                class="form-control"
                style="height:43px; font-size:14px;"
                placeholder="Mínimo 7 caracteres"
                autocomplete="new-password">
              <button
                id="verAccesoPassword"
                type="button"
                class="btn btn-outline-secondary"
                style="min-width:43px;"
                aria-label="Mostrar contraseña"
                aria-pressed="false">
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>

          <!-- CONFIRMACION -->
          <div style="margin-bottom:15px;">
            <label for="accesoConfirmacion" style="
              display:block;
              margin-bottom:7px;
              font-size:13px;
              font-weight:600;
            ">
              Confirmar contraseña
            </label>
            <div class="input-group">
              <input
                id="accesoConfirmacion"
                type="password"
                class="form-control"
                style="height:43px; font-size:14px;"
                placeholder="Repetir contraseña"
                autocomplete="new-password">
              <button
                id="verAccesoConfirmacion"
                type="button"
                class="btn btn-outline-secondary"
                style="min-width:43px;"
                aria-label="Mostrar confirmación"
                aria-pressed="false">
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>

          <!-- ROL: UNA SOLA ETIQUETA -->
          <div style="margin-bottom:15px;">
            <label for="accesoRol" style="
              display:block;
              margin-bottom:7px;
              font-size:13px;
              font-weight:600;
            ">
              Rol de acceso
            </label>
            <select
              id="accesoRol"
              class="form-select"
              style="height:43px; border-radius:8px; font-size:14px;">
              <option value="">Seleccionar rol...</option>
              <option value="ADMIN">Administrador</option>
              <option value="MEDICO">Médico</option>
              <option value="TRIAJE">Personal de triaje</option>
              <option value="FARMACIA">Personal de farmacia</option>
            </select>
          </div>

          <div style="
            background:#F4F9FC;
            border-left:3px solid #43A6CC;
            border-radius:6px;
            padding:10px 12px;
            font-size:12px;
            line-height:1.5;
            color:#597386;
          ">
            El usuario se vinculará con este empleado.
            Su contraseña se almacenará de forma protegida.
          </div>

        </div>
      `,

      didOpen: () => {

        const popup = Swal.getPopup();
        if (!popup) return;

        popup.style.borderRadius = '17px';
        popup.style.borderTop = '5px solid #075878';
        popup.style.boxShadow =
          '0 20px 60px rgba(0, 35, 56, 0.22)';

        const titulo = popup.querySelector<HTMLElement>(
          '.swal2-title'
        );
        if (titulo) {
          titulo.style.color = '#075878';
          titulo.style.fontSize = '23px';
          titulo.style.fontWeight = '700';
          titulo.style.marginBottom = '8px';
        }

        const nombre = popup.querySelector<HTMLElement>(
          '#nombreEmpleadoAcceso'
        );
        if (nombre) {
          nombre.textContent = `${e.nombres} ${e.apellidos}`;
        }

        // Mostrar u ocultar contraseñas sin modificar Angular.
        const configurarVisibilidad = (
          inputId: string,
          botonId: string
        ): void => {

          const input = popup.querySelector<HTMLInputElement>(
            `#${inputId}`
          );
          const boton = popup.querySelector<HTMLButtonElement>(
            `#${botonId}`
          );

          if (!input || !boton) return;

          boton.addEventListener('click', () => {
            const visible = input.type === 'password';
            input.type = visible ? 'text' : 'password';
            boton.setAttribute('aria-pressed', String(visible));
            boton.setAttribute(
              'aria-label',
              visible ? 'Ocultar contraseña' : 'Mostrar contraseña'
            );

            const icono = boton.querySelector('i');
            if (icono) {
              icono.className = visible
                ? 'bi bi-eye-slash'
                : 'bi bi-eye';
            }
          });
        };

        configurarVisibilidad(
          'accesoPassword',
          'verAccesoPassword'
        );
        configurarVisibilidad(
          'accesoConfirmacion',
          'verAccesoConfirmacion'
        );
      },

      showCancelButton: true,
      confirmButtonText: 'Crear acceso',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#075878',
      cancelButtonColor: '#718096',
      focusConfirm: false,

      preConfirm: () => {

        const popup = Swal.getPopup();

        const usuario = popup
          ?.querySelector<HTMLInputElement>('#accesoUsuario')
          ?.value.trim() || '';

        const password = popup
          ?.querySelector<HTMLInputElement>('#accesoPassword')
          ?.value || '';

        const confirmacion = popup
          ?.querySelector<HTMLInputElement>('#accesoConfirmacion')
          ?.value || '';

        const rol = popup
          ?.querySelector<HTMLSelectElement>('#accesoRol')
          ?.value || '';

        if (usuario.length < 3) {
          Swal.showValidationMessage(
            'El usuario debe tener al menos 3 caracteres.'
          );
          return false;
        }

        // Consistente con el texto "Mínimo 12 caracteres".
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
            'Selecciona el rol del trabajador.'
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
        this.listEmpleados();

        Swal.fire({
          icon: 'success',
          title: 'Acceso creado',
          text: 'El trabajador ya puede iniciar sesión con su usuario y contraseña.',
          confirmButtonColor: '#075878'
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
          confirmButtonColor: '#075878'
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
