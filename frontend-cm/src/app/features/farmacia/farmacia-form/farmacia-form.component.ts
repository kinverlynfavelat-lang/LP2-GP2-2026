
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Medicamento } from '../../../core/interfaces/medicamento.interface';
import { MedicamentoService } from '../../../core/services/medicamento.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-farmacia-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './farmacia-form.component.html',
  styleUrl: './farmacia-form.component.css'
})
export class FarmaciaFormComponent implements OnInit {

  private service = inject(MedicamentoService);
  private alert = inject(AlertService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  idMedicamento: number | null = null;
  cargando = false;
  guardando = false;

  medicamento: Medicamento = {
    nombre: '',
    descripcion: '',
    stock: 0,
    precio: 0,
    estado: ''
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id !== null) {
      const numero = Number(id);

      if (!Number.isInteger(numero) || numero <= 0) {
        this.alert.error('Identificador inválido');
        this.cancelar();
        return;
      }

      this.idMedicamento = numero;
      this.cargar(numero);
    }
  }

  cargar(id: number): void {
    this.cargando = true;

    this.service.getMedicamentoById(id).subscribe({
      next: data => {
        this.medicamento = data;
        this.cargando = false;
      },
      error: err => {
        console.error(err);
        this.alert.error('No se pudo cargar el medicamento');
        this.cargando = false;
        this.cancelar();
      }
    });
  }

  guardar(): void {
    if (this.guardando) return;

    const m = this.medicamento;

    if (!m.nombre.trim()) {
      this.alert.error('El nombre es obligatorio');
      return;
    }

    if (!Number.isInteger(m.stock) || m.stock < 0) {
      this.alert.error('El stock debe ser un número entero no negativo');
      return;
    }

    if (!Number.isFinite(m.precio) || m.precio < 0) {
      this.alert.error('El precio no puede ser negativo');
      return;
    }

    if (!m.estado.trim()) {
      this.alert.error('El estado es obligatorio');
      return;
    }

    this.guardando = true;

    const datos: Medicamento = {
      ...m,
      nombre: m.nombre.trim(),
      descripcion: m.descripcion?.trim() || null,
      estado: m.estado.trim().toUpperCase()
    };

    const peticion = this.idMedicamento === null
      ? this.service.createMedicamento(datos)
      : this.service.updateMedicamento(this.idMedicamento, datos);

    peticion.subscribe({
      next: () => {
        this.alert.success(
          this.idMedicamento === null
            ? 'Medicamento registrado correctamente'
            : 'Medicamento actualizado correctamente'
        );
        this.router.navigate(['/farmacia']);
      },
      error: err => {
        console.error(err);
        this.alert.error(
          err.error?.message || 'No se pudo guardar el medicamento'
        );
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/farmacia']);
  }
}
