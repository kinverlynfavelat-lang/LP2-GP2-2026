import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CitaService } from '../../../core/services/cita.service';
import { PersonaService } from '../../../core/services/persona.service';
import { Cita } from '../../../core/interfaces/cita.interface';
import { AlertService } from '../../../core/services/alert.service';

interface PagoPendiente {
  idCita: number;
  idPersona: number;
  paciente: string;
  tipoPaciente: string;
  fechaCita: string;
  horaCita: string;
  estado: string;
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
  private alertService = inject(AlertService);

  citasPendientes: PagoPendiente[] = [];
  citasFiltradas: PagoPendiente[] = [];

  busqueda = '';

  cargando = false;
  errorCarga = false;

  readonly PRECIO_CITA = 50;

  ngOnInit(): void {
    this.listarPendientes();
  }

  // Cargar citas y pacientes
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

        this.citasPendientes = [];

        // Filtrar solamente las citas en recepción
        const citasRecepcion = data.citas.filter(cita =>
          String(cita.estado ?? '').trim().toUpperCase() === 'RECEPCION'
        );

        citasRecepcion.forEach((cita: Cita) => {

          if (cita.idCita == null || cita.idPersona == null) {
            console.warn('Cita sin identificadores:', cita);
            return;
          }

          // Buscar al paciente correspondiente
          const persona = data.personas.find(p =>
            Number(p.idPersona) === Number(cita.idPersona)
          );

          if (!persona) {
            console.warn(
              'No se encontró el paciente de la cita:',
              cita.idCita,
              'ID persona:',
              cita.idPersona
            );
            return;
          }

          const saldo = Math.max(
            0,
            Number(persona.saldoFondo ?? 0)
          );

          // Comprobar derecho al fondo universitario
          const tieneFondo =
            String(persona.tipoPaciente ?? '').trim().toUpperCase() === 'ESTUDIANTE' &&
            String(persona.matriculaVigente ?? '').trim().toUpperCase() === 'SI';

          // Calcular cobertura del fondo
          const descuento = tieneFondo
            ? Math.min(saldo, this.PRECIO_CITA)
            : 0;

          // Calcular importe pendiente en caja
          const montoPagar = this.PRECIO_CITA - descuento;

          this.citasPendientes.push({

            idCita: Number(cita.idCita),
            idPersona: Number(cita.idPersona),

            paciente: `${persona.nombres} ${persona.apellidos}`.trim(),

            tipoPaciente: persona.tipoPaciente ?? 'NO REGISTRADO',

            fechaCita: cita.fechaCita,
            horaCita: cita.horaCita,

            estado: String(cita.estado ?? ''),

            saldoFondo: saldo,
            descuentoFondo: descuento,

            montoTotal: this.PRECIO_CITA,
            montoPagar: montoPagar

          });

        });

        // Ordenar por fecha y hora
        this.citasPendientes.sort((a, b) => {

          const fechaA = `${a.fechaCita} ${a.horaCita}`;
          const fechaB = `${b.fechaCita} ${b.horaCita}`;

          return fechaA.localeCompare(fechaB);

        });

        this.filtrarCitas();

        this.cargando = false;

        console.log(
          'Citas pendientes de pago:',
          this.citasPendientes
        );

      },

      error: (err) => {

        console.error('Error al cargar citas pendientes:', err);

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

  // Buscar por paciente, tipo o número de cita
  filtrarCitas(): void {

    const texto = this.busqueda.trim().toLowerCase();

    this.citasFiltradas = this.citasPendientes.filter(cita => {

      return (
        cita.paciente.toLowerCase().includes(texto) ||
        String(cita.idCita).includes(texto) ||
        cita.tipoPaciente.toLowerCase().includes(texto)
      );

    });

  }

  // Limpiar búsqueda
  limpiarBusqueda(): void {
    this.busqueda = '';
    this.filtrarCitas();
  }

  // Total pendiente en caja
  obtenerTotalPendiente(): number {

    return this.citasPendientes.reduce(
      (total, cita) => total + cita.montoPagar,
      0
    );

  }

  // Total estimado cubierto por el fondo
  obtenerTotalFondo(): number {

    return this.citasPendientes.reduce(
      (total, cita) => total + cita.descuentoFondo,
      0
    );

  }

  // Cantidad de citas que necesitan pasar por caja
  obtenerCitasCaja(): number {

    return this.citasPendientes.filter(
      cita => cita.montoPagar > 0
    ).length;

  }

  // Cantidad de citas cubiertas completamente por el fondo
  obtenerCitasCubiertas(): number {

    return this.citasPendientes.filter(
      cita => cita.montoPagar === 0
    ).length;

  }

  // Actualizar información
  actualizar(): void {
    this.listarPendientes();
  }

}