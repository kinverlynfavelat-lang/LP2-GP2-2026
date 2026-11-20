
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CitaService } from '../../../core/services/cita.service';
import { PersonaService } from '../../../core/services/persona.service';
import { Cita } from '../../../core/interfaces/cita.interface';
import { AlertService } from '../../../core/services/alert.service';
import { PagoService } from '../../../core/services/pago.service';
import { ResumenPago } from '../../../core/interfaces/resumen-pago.interface';

interface PagoPendiente {
  idCita: number;
  idPersona: number;
  paciente: string;
  tipoPaciente: string;
  fechaCita: string;
  horaCita: string;
  estado: string;
  fondoElegible: boolean;
  saldoFondo: number;
  descuentoFondo: number;
  montoTotal: number;
  montoPagar: number;
}

@Component({
  selector: 'app-pago-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './pago-list.component.html',
  styleUrl: './pago-list.component.css'
})
export class PagoListComponent implements OnInit {

  private citaService = inject(CitaService);
  private personaService = inject(PersonaService);
  private pagoService = inject(PagoService);
  private alertService = inject(AlertService);

  // LISTAS
  citasPendientes: PagoPendiente[] = [];
  citasFiltradas: PagoPendiente[] = [];
  resumenPagos: ResumenPago[] = [];

  // BUSQUEDA
  busqueda: string = '';

  // CONTROL
  cargando: boolean = false;
  errorCarga: boolean = false;

  // PRECIO DE LA ATENCION
  readonly PRECIO_CITA = 50;

  ngOnInit(): void {
    this.listarPendientes();
    this.cargarResumenPagos();
  }

  // ==========================================
  // RESUMEN POR MEDIO DE PAGO
  // ==========================================

  cargarResumenPagos(): void {

    this.pagoService.getResumenMedioPago().subscribe({

      next: (data) => {
        this.resumenPagos = data ?? [];
      },

      error: (err) => {
        console.error(
          'No se pudo cargar el resumen de pagos:',
          err
        );

        this.resumenPagos = [];
      }

    });

  }

  // ==========================================
  // TOTAL YA RECAUDADO
  // ==========================================

  get totalRecaudado(): number {

    return this.resumenPagos.reduce(
      (total, pago) =>
        total + (Number(pago.totalRecaudado) || 0),
      0
    );

  }

  // ==========================================
  // CARGAR CITAS EN RECEPCION
  // ==========================================

  listarPendientes(): void {

    if (this.cargando) {
      return;
    }

    this.cargando = true;
    this.errorCarga = false;

    forkJoin({
      citas: this.citaService.getCitas(),
      personas: this.personaService.getPersonas()
    }).subscribe({

      next: (data) => {

        const resultado: PagoPendiente[] = [];

        // SOLO CITAS EN RECEPCION
        const citasRecepcion = data.citas.filter(
          cita =>
            String(cita.estado ?? '')
              .trim()
              .toUpperCase() === 'RECEPCION'
        );

        for (const cita of citasRecepcion) {

          if (
            cita.idCita == null ||
            cita.idPersona == null
          ) {
            continue;
          }

          // BUSCAR PACIENTE
          const persona = data.personas.find(
            p =>
              Number(p.idPersona) ===
              Number(cita.idPersona)
          );

          if (!persona) {
            console.warn(
              'Paciente no encontrado para la cita:',
              cita.idCita
            );

            continue;
          }

          // SALDO DEL FONDO
          const saldo = Math.max(
            0,
            Number(persona.saldoFondo ?? 0)
          );

          // VERIFICAR COBERTURA DEL FONDO
          const fondoElegible =
            String(persona.tipoPaciente ?? '')
              .trim()
              .toUpperCase() === 'ESTUDIANTE' &&

            String(persona.matriculaVigente ?? '')
              .trim()
              .toUpperCase() === 'SI';

          // DESCUENTO ESTIMADO
          const descuento = fondoElegible
            ? Math.min(saldo, this.PRECIO_CITA)
            : 0;

          // IMPORTE ESTIMADO EN CAJA
          const montoPagar =
            this.PRECIO_CITA - descuento;

          resultado.push({

            idCita: Number(cita.idCita),
            idPersona: Number(cita.idPersona),

            paciente:
              `${persona.nombres} ${persona.apellidos}`.trim(),

            tipoPaciente:
              String(persona.tipoPaciente ?? 'NO REGISTRADO')
                .trim()
                .toUpperCase(),

            fechaCita: cita.fechaCita,
            horaCita: cita.horaCita,

            estado: String(cita.estado ?? ''),

            fondoElegible: fondoElegible,
            saldoFondo: saldo,
            descuentoFondo: descuento,

            montoTotal: this.PRECIO_CITA,
            montoPagar: montoPagar

          });

        }

        // ORDENAR POR FECHA Y HORA
        resultado.sort((a, b) => {

          const fechaA =
            `${a.fechaCita} ${a.horaCita}`;

          const fechaB =
            `${b.fechaCita} ${b.horaCita}`;

          return fechaA.localeCompare(fechaB);

        });

        this.citasPendientes = resultado;

        this.filtrarCitas();

        this.cargando = false;

      },

      error: (err) => {

        console.error(
          'Error al cargar citas pendientes:',
          err
        );

        this.errorCarga = true;
        this.cargando = false;

        this.citasPendientes = [];
        this.citasFiltradas = [];

        this.alertService.error(
          'No se pudieron cargar las citas. Verifique la conexión con el servidor.'
        );

      }

    });

  }

  // ==========================================
  // BUSCAR CITAS
  // ==========================================

  filtrarCitas(): void {

    const texto = this.busqueda
      .trim()
      .toLowerCase();

    if (!texto) {

      this.citasFiltradas = [
        ...this.citasPendientes
      ];

      return;
    }

    this.citasFiltradas =
      this.citasPendientes.filter(cita => {

        const paciente =
          cita.paciente.toLowerCase();

        const tipo =
          cita.tipoPaciente.toLowerCase();

        const numero =
          String(cita.idCita);

        return (
          paciente.includes(texto) ||
          numero.includes(texto) ||
          tipo.includes(texto)
        );

      });

  }

  // ==========================================
  // LIMPIAR BUSQUEDA
  // ==========================================

  limpiarBusqueda(): void {

    this.busqueda = '';
    this.filtrarCitas();

  }

  // ==========================================
  // TOTAL ESTIMADO PENDIENTE EN CAJA
  // ==========================================

  obtenerTotalPendiente(): number {

    return this.citasPendientes.reduce(
      (total, cita) =>
        total + cita.montoPagar,
      0
    );

  }

  // ==========================================
  // TOTAL ESTIMADO DE COBERTURA
  // ==========================================

  obtenerTotalFondo(): number {

    return this.citasPendientes.reduce(
      (total, cita) =>
        total + cita.descuentoFondo,
      0
    );

  }

  // ==========================================
  // CITAS QUE REQUIEREN CAJA
  // ==========================================

  obtenerCitasCaja(): number {

    return this.citasPendientes.filter(
      cita => cita.montoPagar > 0
    ).length;

  }

  // ==========================================
  // CITAS CUBIERTAS POR EL FONDO
  // ==========================================

  obtenerCitasCubiertas(): number {

    return this.citasPendientes.filter(
      cita => cita.montoPagar === 0
    ).length;

  }

  // ==========================================
  // ACTUALIZAR INFORMACION
  // ==========================================

  actualizar(): void {

    this.listarPendientes();
    this.cargarResumenPagos();

  }

}
