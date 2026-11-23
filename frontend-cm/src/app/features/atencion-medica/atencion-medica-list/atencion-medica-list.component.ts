
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Cita } from '../../../core/interfaces/cita.interface';
import { CitaService } from '../../../core/services/cita.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-atencion-medica-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './atencion-medica-list.component.html',
  styleUrl: './atencion-medica-list.component.css'
})
export class AtencionListComponent implements OnInit {

  private citaService = inject(CitaService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  citas: Cita[] = [];
  citasFiltradas: Cita[] = [];

  busqueda: string = '';

  cargando: boolean = false;
  errorCarga: boolean = false;

  ngOnInit(): void {
    this.cargarCitas();
  }

  // ==========================================
  // VERIFICAR DATOS COMPLETOS DE TRIAJE
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
  // CARGAR MIS CITAS PENDIENTES DE ATENCION
  // ==========================================

  cargarCitas(): void {

    if (this.cargando) {
      return;
    }

    this.cargando = true;
    this.errorCarga = false;

    // El backend identifica al medico usando JWT.
    this.citaService.getMisCitas().subscribe({

      next: (data) => {

        // Mostrar solamente las citas del medico
        // con estado TRIAJE y signos vitales completos.
        this.citas = data.filter(c => {

          const estado = String(c.estado ?? '')
            .trim()
            .toUpperCase();

          return (
            estado === 'TRIAJE' &&
            this.tieneTriajeCompleto(c)
          );

        });

        this.filtrarCitas();
        this.cargando = false;

      },

      error: (err) => {

        console.error(
          'Error al cargar mis citas medicas:',
          err
        );

        this.errorCarga = true;
        this.cargando = false;

        this.alertService.error(
          'No se pudieron cargar tus citas medicas'
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
      this.citasFiltradas = [...this.citas];
      return;
    }

    this.citasFiltradas = this.citas.filter(c => {

      const paciente =
        (c.paciente ?? '').toLowerCase();

      const medico =
        (c.medico ?? '').toLowerCase();

      const motivo =
        (c.motivoConsulta ?? '').toLowerCase();

      const fecha =
        String(c.fechaCita ?? '').toLowerCase();

      const fechaFormateada =
        this.formatearFecha(c.fechaCita).toLowerCase();

      const hora =
        String(c.horaCita ?? '').toLowerCase();

      const estado =
        String(c.estado ?? '').toLowerCase();

      return (
        paciente.includes(texto) ||
        medico.includes(texto) ||
        motivo.includes(texto) ||
        fecha.includes(texto) ||
        fechaFormateada.includes(texto) ||
        hora.includes(texto) ||
        estado.includes(texto) ||
        'pendiente'.includes(texto)
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

    const partes = fecha
      .substring(0, 10)
      .split('-');

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  // ==========================================
  // ATENDER PACIENTE
  // ==========================================

  atender(cita: Cita): void {

    if (!cita.idCita) {
      return;
    }

    // Validacion adicional en el listado.
    if (
      String(cita.estado ?? '').toUpperCase() !== 'TRIAJE' ||
      !this.tieneTriajeCompleto(cita)
    ) {

      this.alertService.error(
        'El paciente debe completar Triaje antes de ser atendido'
      );

      return;
    }

    this.router.navigate([
      '/atencion/registrar',
      cita.idCita
    ]);
  }

}
