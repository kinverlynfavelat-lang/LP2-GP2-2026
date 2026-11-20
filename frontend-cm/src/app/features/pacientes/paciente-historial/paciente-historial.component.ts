
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CitaService } from '../../../core/services/cita.service';
import { Cita } from '../../../core/interfaces/cita.interface';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-paciente-historial',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './paciente-historial.component.html',
  styleUrl: './paciente-historial.component.css'
})
export class PacienteHistorialComponent implements OnInit {

  private citaService = inject(CitaService);
  private alertService = inject(AlertService);

  // LISTA DE PACIENTES
  pacientesUltimaCita: Cita[] = [];
  pacientesFiltrados: Cita[] = [];

  busqueda: string = '';
  cargando: boolean = false;

  // MODAL DE HISTORIAL CLINICO
  mostrarModal: boolean = false;
  pacienteSeleccionado: Cita | null = null;
  historialCitas: Cita[] = [];
  cargandoHistorial: boolean = false;

  ngOnInit(): void {
    this.cargarPacientesConUltimaCita();
  }

  // ==========================================
  // CARGAR ULTIMA CITA POR PACIENTE
  // ==========================================

  cargarPacientesConUltimaCita(): void {

    this.cargando = true;

    this.citaService.getHistorialPacientes().subscribe({

      next: (data) => {

        this.pacientesUltimaCita = data;
        this.filtrar();
        this.cargando = false;
      },

      error: () => {

        // Consulta alternativa si el endpoint falla
        this.citaService.getCitas().subscribe({

          next: (citas) => {

            const mapa = new Map<number, Cita>();

            for (const c of citas) {

              const id = c.idPersona ||
                (c as any).persona?.idPersona;

              if (id) {

                const actual = mapa.get(id);

                if (!actual ||
                    (c.idCita || 0) > (actual.idCita || 0)) {

                  mapa.set(id, c);
                }
              }
            }

            this.pacientesUltimaCita =
              Array.from(mapa.values());

            this.filtrar();
            this.cargando = false;
          },

          error: () => {

            this.alertService.error(
              'No se pudo cargar el historial de pacientes'
            );

            this.cargando = false;
          }

        });
      }

    });
  }

  // ==========================================
  // BUSCAR PACIENTES
  // ==========================================

  filtrar(): void {

    const texto = this.busqueda.trim().toLowerCase();

    if (!texto) {
      this.pacientesFiltrados = [
        ...this.pacientesUltimaCita
      ];
      return;
    }

    this.pacientesFiltrados =
      this.pacientesUltimaCita.filter(c => {

        const paciente =
          c.paciente?.toLowerCase() || '';

        const dni =
          c.dniPaciente?.toLowerCase() || '';

        const motivo =
          c.motivoConsulta?.toLowerCase() || '';

        const medico =
          c.medico?.toLowerCase() || '';

        return (
          paciente.includes(texto) ||
          dni.includes(texto) ||
          motivo.includes(texto) ||
          medico.includes(texto)
        );
      });
  }

  // ==========================================
  // VER HISTORIAL CLINICO COMPLETO
  // ==========================================

  verHistorial(cita: Cita): void {

    this.pacienteSeleccionado = cita;
    this.mostrarModal = true;
    this.cargandoHistorial = true;
    this.historialCitas = [];

    const idPersona = cita.idPersona;

    if (idPersona) {

      this.citaService.getCitasByPaciente(idPersona)
        .subscribe({

          next: (historial) => {

            this.historialCitas = [...historial].sort(
              (a, b) =>
                (b.idCita || 0) - (a.idCita || 0)
            );

            this.cargandoHistorial = false;
          },

          error: () => {

            this.alertService.error(
              'No se pudo cargar el historial clínico'
            );

            this.cargandoHistorial = false;
          }

        });

    } else {

      this.historialCitas = [cita];
      this.cargandoHistorial = false;
    }
  }

  // ==========================================
  // CERRAR MODAL
  // ==========================================

  cerrarModal(): void {

    this.mostrarModal = false;
    this.pacienteSeleccionado = null;
    this.historialCitas = [];
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

    const valor = fecha.substring(0, 10);
    const partes = valor.split('-');

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  // ==========================================
  // CALCULAR IMC
  // ==========================================

  calcularImc(
    peso: number | null,
    talla: number | null
  ): string {

    if (!peso || !talla || talla <= 0) {
      return '-';
    }

    const alturaM = talla > 3
      ? talla / 100
      : talla;

    const imc = peso / (alturaM * alturaM);

    return imc.toFixed(1);
  }

  // ==========================================
  // COLOR SEGUN ESTADO DE CITA
  // ==========================================

  obtenerClaseEstado(
    estado: string | null
  ): string {

    const e = (estado || '').toUpperCase();

    switch (e) {

      case 'ATENDIDO':
        return 'badge-atendido';

      case 'TRIAJE':
        return 'badge-triaje';

      case 'RECEPCION':
        return 'badge-recepcion';

      case 'DERIVADO':
        return 'badge-derivado';

      case 'ANULADO':
        return 'badge-anulado';

      case 'INASISTENCIA':
        return 'badge-inasistencia';

      default:
        return 'badge-secondary';
    }
  }

}
