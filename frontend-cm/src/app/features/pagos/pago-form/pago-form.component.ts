
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { forkJoin } from 'rxjs';

import { PagoService } from '../../../core/services/pago.service';
import { CitaService } from '../../../core/services/cita.service';
import { PersonaService } from '../../../core/services/persona.service';

import { Pago } from '../../../core/interfaces/pago.interface';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-pago-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pago-form.component.html',
  styleUrl: './pago-form.component.css'
})
export class PagoFormComponent implements OnInit {

  private pagoService = inject(PagoService);
  private citaService = inject(CitaService);
  private personaService = inject(PersonaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertService = inject(AlertService);

  idCita: number | null = null;

  paciente = '';
  tipoPaciente = '';

  fechaCita = '';
  horaCita = '';

  saldoFondo = 0;
  descuentoFondo = 0;

  readonly PRECIO_CITA = 50;

  montoTotal = 50;
  montoPagar = 50;

  fecha = this.obtenerFechaActual();
  motivoPago = 'Pago de atención médica';
  medioPago = '';

  cargando = false;

  ngOnInit(): void {

    const parametro = this.route.snapshot.paramMap.get('id');

    if (!parametro || isNaN(Number(parametro))) {

      this.alertService.error('Identificador de cita inválido');
      this.router.navigate(['/pagos']);
      return;

    }

    this.idCita = Number(parametro);

    this.cargarDatos();

  }

  // Obtener fecha local
  private obtenerFechaActual(): string {

    const hoy = new Date();

    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;

  }

  // Cargar información de cita y paciente
  cargarDatos(): void {

    if (!this.idCita) {
      return;
    }

    this.cargando = true;

    forkJoin({

      cita: this.citaService.getCitaById(this.idCita),
      personas: this.personaService.getPersonas()

    }).subscribe({

      next: (data) => {

        const cita = data.cita;

        if (cita.estado !== 'RECEPCION') {

          this.alertService.error(
            'Esta cita no se encuentra pendiente de pago'
          );

          this.cargando = false;
          this.router.navigate(['/pagos']);
          return;

        }

        const persona = data.personas.find(
          p => p.idPersona === cita.idPersona
        );

        if (!persona) {

          this.alertService.error(
            'No se encontró al paciente de la cita'
          );

          this.cargando = false;
          this.router.navigate(['/pagos']);
          return;

        }

        this.paciente =
          `${persona.nombres} ${persona.apellidos}`;

        this.tipoPaciente =
          persona.tipoPaciente ?? 'NO REGISTRADO';

        this.fechaCita = cita.fechaCita;
        this.horaCita = cita.horaCita;

        this.saldoFondo = Math.max(
          0,
          Number(persona.saldoFondo ?? 0)
        );

        const tieneFondo =
          persona.tipoPaciente === 'ESTUDIANTE' &&
          String(persona.matriculaVigente) === 'SI';

        this.descuentoFondo = tieneFondo
          ? Math.min(this.saldoFondo, this.PRECIO_CITA)
          : 0;

        this.montoPagar =
          this.PRECIO_CITA - this.descuentoFondo;

        this.cargando = false;

      },

      error: (err) => {

        console.error('Error al cargar cita:', err);

        this.alertService.error(
          'No se pudo cargar la información de la cita'
        );

        this.cargando = false;

      }

    });

  }

  // Confirmar pago o cobertura universitaria
  guardar(): void {

    if (!this.idCita || this.cargando) {
      return;
    }

    if (this.montoPagar > 0) {

      if (
        !this.fecha ||
        !this.motivoPago.trim() ||
        !this.medioPago
      ) {

        this.alertService.error(
          'Complete los datos obligatorios del pago'
        );

        return;

      }

    }

    const pago: Pago = {

      idCita: this.idCita,

      fecha: this.montoPagar > 0
        ? this.fecha
        : null,

      motivoPago: this.montoPagar > 0
        ? this.motivoPago.trim()
        : null,

      monto: this.montoPagar,

      medioPago: this.montoPagar > 0
        ? this.medioPago
        : null

    };

    this.cargando = true;

    this.pagoService.registrarPago(pago).subscribe({

      next: (respuesta) => {

        this.alertService.success(
          respuesta || 'Proceso completado correctamente'
        );

        this.router.navigate(['/pagos']);

      },

      error: (err) => {

        console.error('Error al procesar pago:', err);

        const mensaje =
          err.error?.message ||
          err.error ||
          'No se pudo procesar el pago';

        this.alertService.error(String(mensaje));

        this.cargando = false;

      }

    });

  }

  // Regresar al listado
  cancelar(): void {
    this.router.navigate(['/pagos']);
  }

}
