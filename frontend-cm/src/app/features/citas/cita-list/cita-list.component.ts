
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CitaService } from '../../../core/services/cita.service';
import { Cita } from '../../../core/interfaces/cita.interface';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-cita-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cita-list.component.html',
  styleUrl: './cita-list.component.css'
})
export class CitaListComponent implements OnInit {

  private citaService = inject(CitaService);
  private alertService = inject(AlertService);

  citas: Cita[] = [];
  citasFiltradas: Cita[] = [];

  busqueda: string = '';
  cargando: boolean = false;
  procesandoId: number | null = null;

  ngOnInit(): void {
    this.listCitas();
  }

  // ==========================================
  // LISTAR CITAS
  // ==========================================

  listCitas(): void {

    this.cargando = true;

    this.citaService.getCitas().subscribe({

      next: (data) => {

        this.citas = data;
        this.filtrarCitas();
        this.cargando = false;

      },

      error: () => {

        this.cargando = false;

        this.alertService.error(
          'No se pudieron cargar las citas'
        );

      }

    });
  }

  // ==========================================
  // BUSCAR CITAS
  // ==========================================

  filtrarCitas(): void {

    const texto = this.busqueda.trim().toLowerCase();

    if (!texto) {
      this.citasFiltradas = [...this.citas];
      return;
    }

    this.citasFiltradas = this.citas.filter(c => {

      const paciente = c.paciente?.toLowerCase() || '';
      const medico = c.medico?.toLowerCase() || '';
      const fecha = c.fechaCita || '';
      const hora = c.horaCita || '';
      const motivo = c.motivoConsulta?.toLowerCase() || '';
      const estado = c.estado?.toLowerCase() || '';

      const fechaFormateada =
        this.formatearFecha(c.fechaCita);

      return (
        paciente.includes(texto) ||
        medico.includes(texto) ||
        fecha.includes(texto) ||
        fechaFormateada.includes(texto) ||
        hora.includes(texto) ||
        motivo.includes(texto) ||
        estado.includes(texto)
      );

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

  // ==========================================
  // PERMISOS DE ACCIONES SEGUN ESTADO
  // ==========================================

  puedeGestionar(
    estado: string | null | undefined
  ): boolean {

    const e = (estado || '').toUpperCase();

    return e === 'RECEPCION' || e === 'TRIAJE';
  }

  // ==========================================
  // TEXTO PARA CITAS SIN ACCIONES
  // ==========================================

  obtenerTextoAccion(
    estado: string | null | undefined
  ): string {

    switch ((estado || '').toUpperCase()) {

      case 'ATENDIDO':
        return 'Finalizada';

      case 'ANULADO':
        return 'Anulada';

      case 'DERIVADO':
        return 'Derivada';

      case 'INASISTENCIA':
        return 'Inasistencia';

      default:
        return 'Sin acciones';
    }
  }

  // ==========================================
  // ANULAR CITA
  // ==========================================

  async anular(id: number): Promise<void> {

    if (this.procesandoId !== null) {
      return;
    }

    const cita = this.citas.find(c => c.idCita === id);

    if (!cita || !this.puedeGestionar(cita.estado)) {

      this.alertService.error(
        'Esta cita ya no permite anulación'
      );

      return;
    }

    const confirmado = await this.alertService.confirm(
      '¿Está seguro de anular esta cita?'
    );

    if (!confirmado) {
      return;
    }

    this.procesandoId = id;

    this.citaService.anularCita(id).subscribe({

      next: () => {

        this.procesandoId = null;

        this.alertService.toast(
          'Cita anulada correctamente'
        );

        this.listCitas();
      },

      error: (err) => {

        this.procesandoId = null;

        const mensaje =
          typeof err.error?.message === 'string'
            ? err.error.message
            : 'No se pudo anular la cita';

        this.alertService.error(mensaje);

      }

    });
  }

}
