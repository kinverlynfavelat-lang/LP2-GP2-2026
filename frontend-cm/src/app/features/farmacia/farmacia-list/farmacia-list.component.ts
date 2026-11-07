
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Medicamento } from '../../../core/interfaces/medicamento.interface';
import { MedicamentoService } from '../../../core/services/medicamento.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-farmacia-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './farmacia-list.component.html',
  styleUrl: './farmacia-list.component.css'
})
export class FarmaciaListComponent implements OnInit {

  private service = inject(MedicamentoService);
  private alert = inject(AlertService);
  private router = inject(Router);

  medicamentos: Medicamento[] = [];
  busqueda = '';
  cargando = false;
  procesando = false;

  ngOnInit(): void {
    this.cargar();
  }

  get filtrados(): Medicamento[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.medicamentos.filter(m =>
      m.nombre.toLowerCase().includes(texto) ||
      (m.descripcion || '').toLowerCase().includes(texto)
    );
  }

  get totalMedicamentos(): number {
    return this.medicamentos.length;
  }

  get stockTotal(): number {
    return this.medicamentos.reduce((s, m) => s + m.stock, 0);
  }

  get stockBajo(): number {
    return this.medicamentos.filter(m => m.stock <= 10).length;
  }

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

  nuevo(): void {
    this.router.navigate(['/farmacia/nuevo']);
  }

  editar(m: Medicamento): void {
    if (m.idMedicamento == null) return;
    this.router.navigate(['/farmacia/editar', m.idMedicamento]);
  }

  
abrirMovimiento(
  medicamento: Medicamento,
  tipo: 'ingresar' | 'descontar'
): void {

  if (this.procesando) return;

  this.medicamentoSeleccionado = medicamento;
  this.tipoMovimiento = tipo;
  this.cantidadMovimiento = null;
  this.modalStockAbierto = true;
}

cerrarMovimiento(): void {
  if (this.procesando) return;

  this.modalStockAbierto = false;
  this.medicamentoSeleccionado = null;
  this.cantidadMovimiento = null;
}

confirmarMovimiento(): void {

  const medicamento = this.medicamentoSeleccionado;
  const cantidad = this.cantidadMovimiento;

  if (!medicamento || medicamento.idMedicamento == null || this.procesando) {
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

  if (
    this.tipoMovimiento === 'descontar' &&
    cantidad > medicamento.stock
  ) {
    this.alert.error('La cantidad supera el stock disponible');
    return;
  }

  this.procesando = true;

  const peticion = this.tipoMovimiento === 'ingresar'
    ? this.service.ingresarStock(medicamento.idMedicamento, cantidad)
    : this.service.descontarStock(medicamento.idMedicamento, cantidad);

  peticion.subscribe({
    next: () => {
      this.procesando = false;
      this.modalStockAbierto = false;
      this.medicamentoSeleccionado = null;
      this.cantidadMovimiento = null;

      this.alert.success('Stock actualizado correctamente');
      this.cargar();
    },
    error: err => {
      console.error(err);

      this.alert.error(
        err.error?.message || 'No se pudo actualizar el stock'
      );

      this.procesando = false;
    }
  });
}

  modalStockAbierto = false;
  medicamentoSeleccionado: Medicamento | null = null;
  tipoMovimiento: 'ingresar' | 'descontar' = 'ingresar';
  cantidadMovimiento: number | null = null;

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
        this.alert.error('No se pudo eliminar. Puede tener registros relacionados.');
        this.procesando = false;
      }
    });
  }
}
