
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CitaService } from '../../../core/services/cita.service';
import { Cita } from '../../../core/interfaces/cita.interface';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-triaje-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './triaje-list.component.html',
  styleUrl: './triaje-list.component.css'
})
export class TriajeListComponent implements OnInit {

  private citaService = inject(CitaService);
  private alertService = inject(AlertService);

  citas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  citasCriticas: Cita[] = [];

  mostrarSoloCriticas = false;

  citaSeleccionada: Cita | null = null;

  busqueda = '';

  cargando = false;
  guardando = false;
  errorCarga = false;

  // ==========================================
  // DATOS DEL FORMULARIO
  // ==========================================

  temperatura: number | null = null;
  presion: number | null = null;
  frecuenciaCardiaca: number | null = null;
  frecuenciaRespiratoria: number | null = null;

  peso: number | null = null;
  talla: number | null = null;

  motivoEmergencia = '';

  ngOnInit(): void {
    this.listarCitas();
  }

  // ==========================================
  // OBTENER FECHA ACTUAL DE PERU
  // ==========================================

  private obtenerFechaHoyPeru(): string {

    const partes = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());

    const anio = partes.find(
      p => p.type === 'year'
    )?.value;

    const mes = partes.find(
      p => p.type === 'month'
    )?.value;

    const dia = partes.find(
      p => p.type === 'day'
    )?.value;

    return `${anio}-${mes}-${dia}`;
  }

  // ==========================================
  // VERIFICAR SI LA CITA ES DE HOY
  // ==========================================

  private esCitaDeHoy(cita: Cita): boolean {

    if (!cita.fechaCita) {
      return false;
    }

    const fechaCita = String(cita.fechaCita)
      .substring(0, 10);

    return fechaCita === this.obtenerFechaHoyPeru();
  }

  // ==========================================
  // VERIFICAR SI EL TRIAJE ESTA COMPLETO
  // ==========================================

  private tieneTriajeCompleto(cita: Cita): boolean {

    const valores = [
      cita.temperatura,
      cita.presion,
      cita.frecuenciaCardiaca,
      cita.frecuenciaRespiratoria,
      cita.peso,
      cita.talla
    ];

    return valores.every(valor =>
      valor !== null &&
      valor !== undefined &&
      String(valor).trim() !== '' &&
      Number.isFinite(Number(valor)) &&
      Number(valor) > 0
    );
  }

  // ==========================================
  // CANTIDAD DE ALERTAS EN CITAS DE TRIAJE
  // ==========================================

  get cantidadAlertas(): number {

    const ids = new Set(
      this.citasCriticas
        .map(c => c.idCita)
        .filter(id => id != null)
    );

    return this.citas.filter(c =>
      c.idCita != null && ids.has(c.idCita)
    ).length;
  }

  // ==========================================
  // CONSULTAR ALERTAS CONFIGURADAS
  // ==========================================

  cargarCriticas(): void {

    this.citaService.getAlertasTriaje(38.0, 120.0)
      .subscribe({

        next: (data) => {

          this.citasCriticas = data;
          this.filtrarCitas();

        },

        error: () => {

          this.citasCriticas = [];
          this.mostrarSoloCriticas = false;
          this.filtrarCitas();

        }

      });
  }

  // ==========================================
  // LISTAR CITAS PENDIENTES DE TRIAJE
  // ==========================================

  listarCitas(): void {

    if (this.cargando) {
      return;
    }

    this.cargando = true;
    this.errorCarga = false;

    this.citaService.getCitas().subscribe({

      next: (data) => {

        // Mostrar solo las citas que:
        // 1. Esten programadas para HOY.
        // 2. Tengan estado TRIAJE.
        // 3. No tengan el triaje completo.

        this.citas = data.filter(cita => {

          const estado = String(cita.estado ?? '')
            .trim()
            .toUpperCase();

          return (
            estado === 'TRIAJE' &&
            this.esCitaDeHoy(cita) &&
            !this.tieneTriajeCompleto(cita)
          );

        });

        // Ordenar por fecha y hora.
        this.citas.sort((a, b) => {

          const fechaA =
            `${a.fechaCita} ${a.horaCita}`;

          const fechaB =
            `${b.fechaCita} ${b.horaCita}`;

          return fechaA.localeCompare(fechaB);

        });

        this.filtrarCitas();

        this.cargando = false;

        this.cargarCriticas();

      },

      error: (err) => {

        console.error(
          'Error al listar citas:',
          err
        );

        this.errorCarga = true;
        this.cargando = false;

        this.alertService.error(
          'No se pudieron cargar los pacientes pendientes de triaje'
        );

      }

    });
  }

  // ==========================================
  // FILTRAR CITAS
  // ==========================================

  filtrarCitas(): void {

    const texto = this.busqueda.trim().toLowerCase();

    const idsAlertas = new Set(
      this.citasCriticas
        .map(c => c.idCita)
        .filter(id => id != null)
    );

    const fuente = this.mostrarSoloCriticas
      ? this.citas.filter(c =>
          c.idCita != null && idsAlertas.has(c.idCita)
        )
      : this.citas;

    this.citasFiltradas = fuente.filter(cita => {

      const paciente =
        (cita.paciente ?? '').toLowerCase();

      const motivo =
        (cita.motivoConsulta ?? '').toLowerCase();

      const fecha = String(cita.fechaCita ?? '');

      return (
        paciente.includes(texto) ||
        motivo.includes(texto) ||
        fecha.includes(texto)
      );

    });
  }

  // ==========================================
  // MOSTRAR / OCULTAR ALERTAS
  // ==========================================

  alternarCriticas(): void {

    this.mostrarSoloCriticas =
      !this.mostrarSoloCriticas;

    this.filtrarCitas();
  }

  // ==========================================
  // SELECCIONAR CITA
  // ==========================================

  seleccionarCita(cita: Cita): void {

    // No permitir triaje fuera del dia programado.
    if (!this.esCitaDeHoy(cita)) {

      this.alertService.error(
        'Solo puedes realizar triaje de citas programadas para hoy.'
      );

      return;
    }

    const estado = String(cita.estado ?? '')
      .trim()
      .toUpperCase();

    if (
      estado !== 'TRIAJE' ||
      this.tieneTriajeCompleto(cita)
    ) {

      this.alertService.error(
        'Esta cita no tiene un triaje pendiente.'
      );

      return;
    }

    this.citaSeleccionada = cita;

    this.temperatura = cita.temperatura;
    this.presion = cita.presion;
    this.frecuenciaCardiaca = cita.frecuenciaCardiaca;

    this.frecuenciaRespiratoria =
      cita.frecuenciaRespiratoria;

    this.peso = cita.peso;
    this.talla = cita.talla;

    this.motivoEmergencia = '';
  }

  // ==========================================
  // CANCELAR FORMULARIO
  // ==========================================

  cancelar(): void {

    this.citaSeleccionada = null;

    this.temperatura = null;
    this.presion = null;
    this.frecuenciaCardiaca = null;
    this.frecuenciaRespiratoria = null;

    this.peso = null;
    this.talla = null;

    this.motivoEmergencia = '';
  }

  // ==========================================
  // VALIDAR VALORES
  // ==========================================

  private validarValores(): boolean {

    const valores = [
      this.temperatura,
      this.presion,
      this.frecuenciaCardiaca,
      this.frecuenciaRespiratoria,
      this.peso,
      this.talla
    ];

    for (const valor of valores) {

      if (
        valor !== null &&
        (
          !Number.isFinite(Number(valor)) ||
          Number(valor) <= 0
        )
      ) {

        this.alertService.error(
          'Los valores registrados deben ser mayores que cero'
        );

        return false;
      }
    }

    return true;
  }

  // ==========================================
  // GUARDAR EVALUACION DE TRIAJE
  // ==========================================

  guardarTriaje(): void {

    if (!this.citaSeleccionada || this.guardando) {
      return;
    }

    const cita = this.citaSeleccionada;

    // VALIDACION DE FECHA ANTES DE GUARDAR

    if (!this.esCitaDeHoy(cita)) {

      this.alertService.error(
        'No puedes registrar triaje fuera de la fecha programada de la cita.'
      );

      return;
    }

    // VALIDACION DE ESTADO

    if (
      String(cita.estado ?? '').trim().toUpperCase()
      !== 'TRIAJE'
    ) {

      this.alertService.error(
        'La cita no se encuentra en estado TRIAJE.'
      );

      return;
    }

    if (!this.validarValores()) {
      return;
    }

    const datosActualizados: Cita = {

      idCita: cita.idCita,

      fechaCita: cita.fechaCita,
      horaCita: cita.horaCita,

      notificacion: cita.notificacion,

      temperatura: this.temperatura,
      presion: this.presion,
      frecuenciaCardiaca: this.frecuenciaCardiaca,

      frecuenciaRespiratoria:
        this.frecuenciaRespiratoria,

      peso: this.peso,
      talla: this.talla,

      motivoConsulta: cita.motivoConsulta,

      diagnostico: cita.diagnostico,
      tratamiento: cita.tratamiento,
      observaciones: cita.observaciones,
      indicaciones: cita.indicaciones,

      estado: 'TRIAJE',

      idMedico: cita.idMedico,
      idPersona: cita.idPersona,
      idEmpleado: cita.idEmpleado,

      paciente: cita.paciente,
      medico: cita.medico,
      empleadoTriaje: cita.empleadoTriaje

    };

    this.guardando = true;

    this.citaService.updateCita(
      cita.idCita!,
      datosActualizados
    ).subscribe({

      next: () => {

        this.alertService.success(
          'Evaluación de triaje registrada correctamente'
        );

        this.cancelar();
        this.guardando = false;
        this.listarCitas();

      },

      error: (err) => {

        console.error(
          'Error al guardar triaje:',
          err
        );

        this.alertService.error(
          err.error?.message ||
          'No se pudo guardar la evaluación de triaje'
        );

        this.guardando = false;

      }

    });
  }

  // ==========================================
  // ACTUALIZAR LISTADO
  // ==========================================

  actualizar(): void {
    this.listarCitas();
  }

}
