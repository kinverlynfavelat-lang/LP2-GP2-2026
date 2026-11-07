
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CitaService } from '../../../core/services/cita.service';
import { Cita } from '../../../core/interfaces/cita.interface';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-triaje-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './triaje-form.component.html',
  styleUrl: './triaje-form.component.css'
})
export class TriajeFormComponent implements OnInit {

  private citaService = inject(CitaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertService = inject(AlertService);

  idCita!: number;

  cita: Cita | null = null;

  cargando = false;
  guardando = false;

  temperatura: number | null = null;
  presion: number | null = null;
  frecuenciaCardiaca: number | null = null;
  frecuenciaRespiratoria: number | null = null;

  peso: number | null = null;
  talla: number | null = null;

  motivoEmergencia = '';

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id || isNaN(Number(id))) {
      this.alertService.error('Identificador de cita inválido');
      this.router.navigate(['/triaje']);
      return;
    }

    this.idCita = Number(id);
    this.cargarCita();

  }

  // Cargar información del paciente
  cargarCita(): void {

    this.cargando = true;

    this.citaService.getCitaById(this.idCita).subscribe({

      next: (data) => {

        if (data.estado !== 'TRIAJE') {

          this.alertService.error(
            'Esta cita ya no está pendiente de triaje'
          );

          this.router.navigate(['/triaje']);
          return;

        }

        this.cita = data;

        this.temperatura = data.temperatura;
        this.presion = data.presion;
        this.frecuenciaCardiaca = data.frecuenciaCardiaca;
        this.frecuenciaRespiratoria = data.frecuenciaRespiratoria;

        this.peso = data.peso;
        this.talla = data.talla;

        this.cargando = false;

      },

      error: (err) => {

        console.error('Error al cargar cita:', err);

        this.alertService.error(
          'No se pudo cargar la información del paciente'
        );

        this.cargando = false;
        this.router.navigate(['/triaje']);

      }

    });

  }

  // Validar valores ingresados
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
        (!Number.isFinite(Number(valor)) || Number(valor) <= 0)
      ) {

        this.alertService.error(
          'Los valores registrados deben ser mayores que cero'
        );

        return false;

      }

    }

    return true;

  }

  // Preparar información para actualizar
  private obtenerDatosActualizados(estado: string, observaciones: string | null): Cita {

    const cita = this.cita!;

    return {

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

      observaciones: observaciones,
      indicaciones: cita.indicaciones,

      estado: estado,

      idMedico: cita.idMedico,
      idPersona: cita.idPersona,
      idEmpleado: cita.idEmpleado

    };

  }

  // Guardar evaluación
  guardarTriaje(): void {

    if (!this.cita || this.guardando) return;

    if (!this.validarValores()) return;

    this.guardando = true;

    const datos = this.obtenerDatosActualizados(
      'TRIAJE',
      this.cita.observaciones
    );

    this.citaService.updateCita(
      this.idCita,
      datos
    ).subscribe({

      next: () => {

        this.alertService.success(
          'Evaluación de triaje registrada correctamente'
        );

        this.router.navigate(['/triaje']);

      },

      error: (err) => {

        console.error('Error al guardar triaje:', err);

        this.alertService.error(
          err.error?.message ||
          'No se pudo guardar la evaluación'
        );

        this.guardando = false;

      }

    });

  }


  cancelar(): void {
    this.router.navigate(['/triaje']);
  }

}
