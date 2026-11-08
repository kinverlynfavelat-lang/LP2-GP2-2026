
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DetalleMedicamentoResponse } from '../../../core/interfaces/detalle-medicamento.interface';
import { DetalleMedicamentoService } from '../../../core/services/detalle-medicamento.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-detalle-medicamento-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-medicamento-list.component.html',
  styleUrl: './detalle-medicamento-list.component.css'
})
export class DetalleMedicamentoListComponent implements OnInit {

  private service = inject(DetalleMedicamentoService);
  private alert = inject(AlertService);
  private router = inject(Router);

  entregas: DetalleMedicamentoResponse[] = [];

  busqueda = '';
  fechaFiltro = '';

  cargando = false;

  ngOnInit(): void {
    this.cargar();
  }

  // FILTRAR ENTREGAS
  get filtrados(): DetalleMedicamentoResponse[] {

    const texto = this.busqueda.trim().toLowerCase();

    return this.entregas.filter(e => {

      const coincideTexto =
        e.paciente.toLowerCase().includes(texto) ||
        e.nombreMedicamento.toLowerCase().includes(texto) ||
        e.idReceta.toString().includes(texto) ||
        e.idCita.toString().includes(texto);

      const coincideFecha =
        !this.fechaFiltro ||
        e.fechaSalida === this.fechaFiltro;

      return coincideTexto && coincideFecha;
    });
  }

  // TOTAL DE MOVIMIENTOS
  get totalEntregas(): number {
    return this.entregas.length;
  }

  // UNIDADES ENTREGADAS
  get unidadesEntregadas(): number {
    return this.entregas.reduce(
      (total, e) => total + e.cantidadEntregada,
      0
    );
  }

  // PACIENTES ATENDIDOS
  get pacientesAtendidos(): number {
    return new Set(
      this.entregas.map(e => e.idPersona)
    ).size;
  }

  // CARGAR ENTREGAS
  cargar(): void {

    this.cargando = true;

    this.service.getDetalleMedicamentos().subscribe({

      next: data => {
        this.entregas = data ?? [];
        this.cargando = false;
      },

      error: err => {
        console.error(err);
        this.alert.error('No se pudieron cargar las entregas');
        this.cargando = false;
      }

    });
  }

  // NUEVA ENTREGA
  nuevo(): void {
    this.router.navigate(['/farmacia/entregas/nuevo']);
  }

  // LIMPIAR FILTROS
  limpiarFiltros(): void {
    this.busqueda = '';
    this.fechaFiltro = '';
  }

  // FORMATEAR FECHA
  formatearFecha(fecha: string): string {

    if (!fecha) return '';

    const [anio, mes, dia] = fecha.split('-');

    return `${dia}/${mes}/${anio}`;
  }

}
