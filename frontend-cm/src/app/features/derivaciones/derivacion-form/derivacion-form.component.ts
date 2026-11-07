
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

// ==========================================
// ESTADOS OFICIALES DEL BACKEND
// ==========================================

type EstadoDerivacion =
  | 'PENDIENTE'
  | 'REALIZADA'
  | 'CANCELADA';

// ==========================================
// INTERFAZ DE CITA MÉDICA
// ==========================================

interface Cita {
  idCita: number;
  fechaCita: string;
  horaCita: string;
  paciente: string;
  medico: string;
  diagnostico: string | null;
  tratamiento: string | null;
  estado: string;
}

// ==========================================
// INTERFAZ DE DERIVACIÓN
// ==========================================

interface Derivacion {
  idDerivacion: number;
  fecha: string;
  motivo: string;
  centroDestino: string;
  responsable: string;
  estado: EstadoDerivacion;
  idCita: number;
}

// ==========================================
// DATOS PARA ENVIAR AL BACKEND
// ==========================================

interface DerivacionRequest {
  idDerivacion: number | null;
  fecha: string;
  motivo: string;
  centroDestino: string;
  responsable: string;
  estado: EstadoDerivacion;
  idCita: number;
}

// ==========================================
// COMPONENTE
// ==========================================

@Component({
  selector: 'app-derivacion-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './derivacion-form.component.html',
  styleUrl: './derivacion-form.component.css'
})
export class DerivacionFormComponent implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private api = '/api/v1';

  // ==========================================
  // CONTROL DEL FORMULARIO
  // ==========================================

  idDerivacion: number | null = null;
  modoEdicion = false;

  // ==========================================
  // CITAS MÉDICAS
  // ==========================================

  citas: Cita[] = [];
  citaSeleccionada: Cita | null = null;

  // ==========================================
  // ESTADOS DEL BACKEND
  // ==========================================

  readonly estados: EstadoDerivacion[] = [
    'PENDIENTE',
    'REALIZADA',
    'CANCELADA'
  ];

  // ==========================================
  // DATOS DEL FORMULARIO
  // ==========================================

  formulario: {
    fecha: string;
    motivo: string;
    centroDestino: string;
    responsable: string;
    estado: EstadoDerivacion;
    idCita: number | null;
  } = {
    fecha: this.obtenerFechaActual(),
    motivo: '',
    centroDestino: '',
    responsable: '',
    estado: 'PENDIENTE',
    idCita: null
  };

  // ==========================================
  // CONTROL DE CARGA
  // ==========================================

  cargando = false;
  guardando = false;

  error = '';
  mensaje = '';

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  ngOnInit(): void {
    const parametro = this.route.snapshot.paramMap.get('id');

    if (parametro !== null) {
      const id = Number(parametro);

      if (!Number.isInteger(id) || id <= 0) {
        this.error =
          'El identificador de la derivación no es válido.';
        return;
      }

      this.idDerivacion = id;
      this.modoEdicion = true;
    }

    this.cargarDatos();
  }

  // ==========================================
  // OBTENER FECHA ACTUAL
  // ==========================================

  obtenerFechaActual(): string {
    const ahora = new Date();

    const anio = ahora.getFullYear();

    const mes = String(
      ahora.getMonth() + 1
    ).padStart(2, '0');

    const dia = String(
      ahora.getDate()
    ).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  // ==========================================
  // CARGAR CITAS MÉDICAS
  // ==========================================

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    this.http.get<Cita[]>(
      `${this.api}/citas`
    ).subscribe({
      next: (citas) => {
        this.citas = citas ?? [];

        if (
          this.modoEdicion &&
          this.idDerivacion !== null
        ) {
          this.cargarDerivacion(this.idDerivacion);
        } else {
          this.cargando = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;

        this.error =
          'No se pudieron cargar las citas médicas.';

        console.error(
          'Error al cargar citas:',
          err
        );
      }
    });
  }

  // ==========================================
  // SELECCIONAR CITA MÉDICA
  // ==========================================

  seleccionarCita(): void {
    this.citaSeleccionada =
      this.citas.find(
        cita =>
          cita.idCita === Number(this.formulario.idCita)
      ) ?? null;

    this.error = '';
  }

  // ==========================================
  // CARGAR DERIVACIÓN PARA EDITAR
  // ==========================================

  cargarDerivacion(id: number): void {
    this.http.get<Derivacion>(
      `${this.api}/derivaciones/${id}`
    ).subscribe({
      next: (derivacion) => {

        this.formulario = {
          fecha: derivacion.fecha,
          motivo: derivacion.motivo,
          centroDestino: derivacion.centroDestino,
          responsable: derivacion.responsable,
          estado: derivacion.estado,
          idCita: derivacion.idCita
        };

        this.seleccionarCita();

        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;

        this.error =
          'No se pudo cargar la derivación seleccionada.';

        console.error(
          'Error al cargar derivación:',
          err
        );
      }
    });
  }

  // ==========================================
  // VALIDAR FORMULARIO
  // ==========================================

  validarFormulario(): boolean {
    this.error = '';

    // VALIDAR CITA
    if (this.formulario.idCita === null) {
      this.error = 'Selecciona una cita médica.';
      return false;
    }

    if (!this.citaSeleccionada) {
      this.error =
        'La cita médica seleccionada no existe.';
      return false;
    }

    // VALIDAR FECHA
    if (!this.formulario.fecha) {
      this.error =
        'La fecha de derivación es obligatoria.';
      return false;
    }

    // VALIDAR MOTIVO
    if (!this.formulario.motivo.trim()) {
      this.error =
        'Ingresa el motivo de la derivación.';
      return false;
    }

    // VALIDAR CENTRO DE DESTINO
    if (!this.formulario.centroDestino.trim()) {
      this.error =
        'Ingresa el centro de destino.';
      return false;
    }

    // VALIDAR RESPONSABLE
    if (!this.formulario.responsable.trim()) {
      this.error =
        'Ingresa el responsable de la derivación.';
      return false;
    }

    // VALIDAR ESTADO
    if (!this.estados.includes(this.formulario.estado)) {
      this.error =
        'Selecciona un estado de derivación válido.';
      return false;
    }

    return true;
  }

  // ==========================================
  // GUARDAR O ACTUALIZAR DERIVACIÓN
  // ==========================================

  guardarDerivacion(): void {
    this.error = '';
    this.mensaje = '';

    if (
      this.guardando ||
      !this.validarFormulario()
    ) {
      return;
    }

    const datos: DerivacionRequest = {
      idDerivacion: this.modoEdicion
        ? this.idDerivacion
        : null,

      fecha: this.formulario.fecha,

      motivo: this.formulario.motivo.trim(),

      centroDestino:
        this.formulario.centroDestino.trim(),

      responsable:
        this.formulario.responsable.trim(),

      estado: this.formulario.estado,

      idCita: Number(this.formulario.idCita)
    };

    this.guardando = true;

    // SI EDITAMOS: PUT
    // SI REGISTRAMOS: POST

    const peticion =
      this.modoEdicion &&
      this.idDerivacion !== null

        ? this.http.put<Derivacion>(
            `${this.api}/derivaciones/${this.idDerivacion}`,
            datos
          )

        : this.http.post<Derivacion>(
            `${this.api}/derivaciones`,
            datos
          );

    peticion.subscribe({
      next: () => {
        this.guardando = false;

        this.router.navigate([
          '/derivaciones'
        ]);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;

        this.error =
          typeof err.error?.message === 'string'
            ? err.error.message
            : 'No se pudo guardar la derivación médica.';

        console.error(
          'Error al guardar derivación:',
          err
        );
      }
    });
  }

  // ==========================================
  // CANCELAR Y REGRESAR
  // ==========================================

  cancelar(): void {
    this.router.navigate([
      '/derivaciones'
    ]);
  }

  // ==========================================
  // TÍTULO DINÁMICO
  // ==========================================

  get tituloFormulario(): string {
    return this.modoEdicion
      ? 'Editar derivación médica'
      : 'Nueva derivación médica';
  }
}
