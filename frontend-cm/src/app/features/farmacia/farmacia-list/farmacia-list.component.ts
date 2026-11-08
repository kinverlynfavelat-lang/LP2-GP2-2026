
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Medicamento } from '../../../core/interfaces/medicamento.interface';
import { MedicamentoService } from '../../../core/services/medicamento.service';
import { AlertService } from '../../../core/services/alert.service';

import { DetalleMedicamentoListComponent } from '../detalle-medicamento-list/detalle-medicamento-list.component';

@Component({
  selector: 'app-farmacia-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DetalleMedicamentoListComponent
  ],
  templateUrl: './farmacia-list.component.html',
  styleUrl: './farmacia-list.component.css'
})
export class FarmaciaListComponent implements OnInit {

  private service = inject(MedicamentoService);
  private alert = inject(AlertService);
  private router = inject(Router);

  // PESTAÑAS
  vistaActual: 'inventario' | 'entregas' = 'inventario';

  medicamentos: Medicamento[] = [];
  busqueda = '';

  cargando = false;
  procesando = false;

  modalStockAbierto = false;
  medicamentoSeleccionado: Medicamento | null = null;
  cantidadMovimiento: number | null = null;

  ngOnInit(): void {
    this.cargar();
  }

  // CAMBIAR PESTAÑA
  cambiarVista(vista: 'inventario' | 'entregas'): void {
    this.vistaActual = vista;
  }

  // FILTRAR MEDICAMENTOS
  get filtrados(): Medicamento[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.medicamentos.filter(m =>
      m.nombre.toLowerCase().includes(texto) ||
      (m.descripcion || '').toLowerCase().includes(texto)
    );
  }

  // TOTAL MEDICAMENTOS
  get totalMedicamentos(): number {
    return this.medicamentos.length;
  }

  // STOCK TOTAL
  get stockTotal(): number {
    return this.medicamentos.reduce((s, m) => s + m.stock, 0);
  }

  // STOCK BAJO
  get stockBajo(): number {
    return this.medicamentos.filter(m => m.stock <= 10).length;
  }

  // LISTAR MEDICAMENTOS
  cargar(): void {
    this.cargando = true;

    this.service.getMedicamentos().subscribe({
      next: data => {
        this.medicamentos = data;
        this.cargando = false;
      },
      error: err => {
        console.error(err);
        this.alert.error('No se pudieron cargar los medicamentos');
        this.cargando = false;
      }
    });
  }

  // NUEVO MEDICAMENTO
  nuevo(): void {
    this.router.navigate(['/farmacia/nuevo']);
  }

  // EDITAR MEDICAMENTO
  editar(m: Medicamento): void {
    if (m.idMedicamento == null) return;

    this.router.navigate(['/farmacia/editar', m.idMedicamento]);
  }

  // ABRIR MODAL DE INGRESO
  abrirMovimiento(medicamento: Medicamento): void {
    if (this.procesando) return;

    this.medicamentoSeleccionado = medicamento;
    this.cantidadMovimiento = null;
    this.modalStockAbierto = true;
  }

  // CERRAR MODAL
  cerrarMovimiento(): void {
    if (this.procesando) return;

    this.modalStockAbierto = false;
    this.medicamentoSeleccionado = null;
    this.cantidadMovimiento = null;
  }

  // CONFIRMAR INGRESO DE STOCK
  confirmarMovimiento(): void {

    const medicamento = this.medicamentoSeleccionado;
    const cantidad = this.cantidadMovimiento;

    if (
      !medicamento ||
      medicamento.idMedicamento == null ||
      this.procesando
    ) {
      return;
    }

    if (
      cantidad === null ||
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {
      this.alert.error('Ingresa una cantidad entera mayor que cero');
      return;
    }

    this.procesando = true;

    this.service.ingresarStock(
      medicamento.idMedicamento,
      cantidad
    ).subscribe({
      next: () => {

        this.procesando = false;
        this.modalStockAbierto = false;
        this.medicamentoSeleccionado = null;
        this.cantidadMovimiento = null;

        this.alert.success('Stock ingresado correctamente');

        this.cargar();
      },
      error: err => {

        console.error(err);

        this.alert.error(
          err.error?.message || 'No se pudo ingresar el stock'
        );

        this.procesando = false;
      }
    });
  }

  // ELIMINAR MEDICAMENTO
  async eliminar(m: Medicamento): Promise<void> {

    if (m.idMedicamento == null || this.procesando) return;

    const confirmado = await this.alert.confirm(
      `¿Eliminar el medicamento "${m.nombre}"?`
    );

    if (!confirmado) return;

    this.procesando = true;

    this.service.deleteMedicamento(m.idMedicamento).subscribe({
      next: () => {

        this.alert.success('Medicamento eliminado');

        this.procesando = false;
        this.cargar();
      },
      error: err => {

        console.error(err);

        this.alert.error(
          'No se pudo eliminar. Puede tener registros relacionados.'
        );

        this.procesando = false;
      }
    });
  }
}
