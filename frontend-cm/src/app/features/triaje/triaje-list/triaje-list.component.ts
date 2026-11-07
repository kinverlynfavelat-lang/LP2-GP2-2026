
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CitaService } from '../../../core/services/cita.service';
import { Cita } from '../../../core/interfaces/cita.interface';
import { AlertService } from '../../../core/services/alert.service';
import { RouterLink } from '@angular/router';

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

  citaSeleccionada: Cita | null = null;

  busqueda = '';

  cargando = false;
  guardando = false;
  errorCarga = false;

  // Datos del formulario
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

  // Listar pacientes pendientes de triaje
  listarCitas(): void {

    if (this.cargando) return;

    this.cargando = true;
    this.errorCarga = false;

    this.citaService.getCitas().subscribe({

      next: (data) => {

        this.citas = data.filter(cita =>
          String(cita.estado ?? '').trim().toUpperCase() === 'TRIAJE'
        );

        this.citas.sort((a, b) => {

          const fechaA = `${a.fechaCita} ${a.horaCita}`;
          const fechaB = `${b.fechaCita} ${b.horaCita}`;

          return fechaA.localeCompare(fechaB);

        });

        this.filtrarCitas();
        this.cargando = false;

      },

      error: (err) => {

        console.error('Error al listar citas:', err);

        this.errorCarga = true;
        this.cargando = false;

        this.alertService.error(
          'No se pudieron cargar los pacientes pendientes de triaje'
        );

      }

    });

  }

  // Buscar pacientes
  filtrarCitas(): void {

    const texto = this.busqueda.trim().toLowerCase();

    this.citasFiltradas = this.citas.filter(cita => {

      return (
        (cita.paciente ?? '').toLowerCase().includes(texto) ||
        (cita.motivoConsulta ?? '').toLowerCase().includes(texto)
      );

    });

  }

  // Seleccionar paciente
  seleccionarCita(cita: Cita): void {

    this.citaSeleccionada = cita;

    this.temperatura = cita.temperatura;
    this.presion = cita.presion;
    this.frecuenciaCardiaca = cita.frecuenciaCardiaca;
    this.frecuenciaRespiratoria = cita.frecuenciaRespiratoria;

    this.peso = cita.peso;
    this.talla = cita.talla;

    this.motivoEmergencia = '';

  }

  // Limpiar formulario
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

  // Validar que los valores ingresados sean correctos
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

      if (valor !== null &&
          (!Number.isFinite(Number(valor)) || Number(valor) <= 0)) {

        this.alertService.error(
          'Los valores registrados deben ser mayores que cero'
        );

        return false;

      }

    }

    return true;

  }

  // Guardar evaluación de triaje
  guardarTriaje(): void {

    if (!this.citaSeleccionada || this.guardando) {
      return;
    }

    if (!this.validarValores()) {
      return;
    }

    const cita = this.citaSeleccionada;

    const datosActualizados: Cita = {

      idCita: cita.idCita,

      fechaCita: cita.fechaCita,
      horaCita: cita.horaCita,

      notificacion: cita.notificacion,

      temperatura: this.temperatura,
      presion: this.presion,
      frecuenciaCardiaca: this.frecuenciaCardiaca,
      frecuenciaRespiratoria: this.frecuenciaRespiratoria,

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

        console.error('Error al guardar triaje:', err);

        this.alertService.error(
          err.error?.message ||
          'No se pudo guardar la evaluación de triaje'
        );

        this.guardando = false;

      }

    });

  }


  // Actualizar listado
  actualizar(): void {
    this.listarCitas();
  }

}
