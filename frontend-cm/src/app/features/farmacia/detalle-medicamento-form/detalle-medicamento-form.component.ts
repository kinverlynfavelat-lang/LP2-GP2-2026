
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  DetalleMedicamentoDTO,
  DetalleMedicamentoResponse
} from '../../../core/interfaces/detalle-medicamento.interface';

import { DetalleMedicamentoService } from '../../../core/services/detalle-medicamento.service';
import { AlertService } from '../../../core/services/alert.service';

interface DetalleReceta {
  idDetalleReceta: number;
  idMedicamento: number;
  medicamento: string;
  dosis: string;
  indicaciones: string;
  cantidad: number;
}

interface Receta {
  idReceta: number;
  idCita: number;
  fechaEmision: string;
  paciente: string;
  detalles: DetalleReceta[];
}

interface Medicamento {
  idMedicamento: number;
  nombre: string;
  stock: number;
}

interface DetallePendiente {
  idDetalleReceta: number;
  idReceta: number;
  idCita: number;
  paciente: string;
  fechaEmision: string;
  idMedicamento: number;
  medicamento: string;
  dosis: string;
  indicaciones: string;
  cantidadPrescrita: number;
  cantidadEntregada: number;
  cantidadPendiente: number;
  stockDisponible: number;
}

@Component({
  selector: 'app-detalle-medicamento-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-medicamento-form.component.html',
  styleUrl: './detalle-medicamento-form.component.css'
})
export class DetalleMedicamentoFormComponent implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);
  private alert = inject(AlertService);

  private detalleService = inject(DetalleMedicamentoService);

  private api = '/api/v1';

  detallesPendientes: DetallePendiente[] = [];

  idDetalleRecetaSeleccionado: number | null = null;
  cantidadEntrega: number | null = null;

  cargando = false;
  procesando = false;

  ngOnInit(): void {
    this.cargarDatos();
  }

  // =====================================
  // CARGAR RECETAS, ENTREGAS Y MEDICAMENTOS
  // =====================================

  cargarDatos(): void {

    this.cargando = true;

    forkJoin({
      recetas: this.http.get<Receta[]>(
        `${this.api}/recetas`
      ),

      entregas: this.detalleService.getDetalleMedicamentos(),

      medicamentos: this.http.get<Medicamento[]>(
        `${this.api}/medicamentos`
      )

    }).subscribe({

      next: ({ recetas, entregas, medicamentos }) => {

        this.detallesPendientes = recetas.flatMap(receta =>

          receta.detalles.map(detalle => {

            const cantidadEntregada = entregas
              .filter(e =>
                e.idDetalleReceta === detalle.idDetalleReceta
              )
              .reduce(
                (total, e) => total + (e.cantidadEntregada ?? 0),
                0
              );

            const medicamento = medicamentos.find(
              m => m.idMedicamento === detalle.idMedicamento
            );

            const cantidadPendiente = Math.max(
              0,
              detalle.cantidad - cantidadEntregada
            );

            return {
              idDetalleReceta: detalle.idDetalleReceta,
              idReceta: receta.idReceta,
              idCita: receta.idCita,
              paciente: receta.paciente,
              fechaEmision: receta.fechaEmision,
              idMedicamento: detalle.idMedicamento,
              medicamento: detalle.medicamento,
              dosis: detalle.dosis,
              indicaciones: detalle.indicaciones,
              cantidadPrescrita: detalle.cantidad,
              cantidadEntregada,
              cantidadPendiente,
              stockDisponible: medicamento?.stock ?? 0
            };

          })

        ).filter(d => d.cantidadPendiente > 0);

        this.cargando = false;
      },

      error: err => {

        console.error(err);

        this.alert.error(
          'No se pudieron cargar los datos de farmacia'
        );

        this.cargando = false;
      }
    });
  }

  // =====================================
  // DETALLE SELECCIONADO
  // =====================================

  get detalleSeleccionado(): DetallePendiente | undefined {

    return this.detallesPendientes.find(
      d => d.idDetalleReceta === this.idDetalleRecetaSeleccionado
    );
  }

  // =====================================
  // REGISTRAR ENTREGA
  // =====================================

  registrar(): void {

    const detalle = this.detalleSeleccionado;
    const cantidad = this.cantidadEntrega;

    if (!detalle || this.procesando) return;

    if (
      cantidad === null ||
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {

      this.alert.error(
        'Ingresa una cantidad entera mayor que cero'
      );

      return;
    }

    if (cantidad > detalle.cantidadPendiente) {

      this.alert.error(
        'La cantidad supera lo pendiente de la receta'
      );

      return;
    }

    if (cantidad > detalle.stockDisponible) {

      this.alert.error(
        'No hay suficiente stock disponible'
      );

      return;
    }

    const dto: DetalleMedicamentoDTO = {
      idDetalleReceta: detalle.idDetalleReceta,
      cantidadEntregada: cantidad
    };

    this.procesando = true;

    this.detalleService.registrarEntrega(dto).subscribe({

      next: () => {

        this.alert.success(
          'Medicamento entregado correctamente'
        );

        this.procesando = false;
        this.idDetalleRecetaSeleccionado = null;
        this.cantidadEntrega = null;

        this.cargarDatos();
      },

      error: err => {

        console.error(err);

        this.alert.error(
          err.error?.message || 'No se pudo registrar la entrega'
        );

        this.procesando = false;
      }
    });
  }

  // =====================================
  // CANCELAR
  // =====================================

  cancelar(): void {
    this.router.navigate(['/farmacia']);
  }

}
