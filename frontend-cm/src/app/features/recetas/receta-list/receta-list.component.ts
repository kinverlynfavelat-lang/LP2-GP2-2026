
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

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
  edad: number | null;
  diagnostico: string;
  tratamiento: string;
  detalles: DetalleReceta[];
}

@Component({
  selector: 'app-receta-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receta-list.component.html',
  styleUrl: './receta-list.component.css'
})
export class RecetaListComponent implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);
  private alertService = inject(AlertService);

  private apiUrl = '/api/v1/recetas';

  // LISTAS
  recetas: Receta[] = [];
  recetasFiltradas: Receta[] = [];

  // BUSQUEDA
  busqueda = '';

  // CONTROL
  cargando = false;
  eliminando = false;

  // MENSAJES
  error = '';
  mensaje = '';

  // MODAL DE DETALLE
  recetaSeleccionada: Receta | null = null;

  ngOnInit(): void {
    this.cargarRecetas();
  }

  // ==========================================
  // LISTAR RECETAS
  // ==========================================

  cargarRecetas(): void {

    this.cargando = true;
    this.error = '';

    this.http.get<Receta[]>(this.apiUrl).subscribe({

      next: (datos) => {

        this.recetas = datos ?? [];
        this.filtrarRecetas();
        this.cargando = false;

      },

      error: (err: HttpErrorResponse) => {

        this.cargando = false;

        this.error =
          'No se pudieron cargar las recetas médicas.';

        console.error(
          'Error al listar recetas:',
          err
        );

      }

    });
  }

  // ==========================================
  // BUSCAR RECETAS
  // ==========================================

  filtrarRecetas(): void {

    const texto = this.busqueda.trim().toLowerCase();

    if (!texto) {
      this.recetasFiltradas = [...this.recetas];
      return;
    }

    this.recetasFiltradas = this.recetas.filter(receta =>

      (receta.paciente ?? '')
        .toLowerCase()
        .includes(texto) ||

      (receta.diagnostico ?? '')
        .toLowerCase()
        .includes(texto) ||

      receta.idReceta.toString().includes(texto) ||

      receta.idCita.toString().includes(texto)

    );
  }

  // ==========================================
  // NUEVA RECETA
  // ==========================================

  nuevaReceta(): void {

    this.router.navigate(['/recetas/nuevo']);

  }

  // ==========================================
  // EDITAR RECETA
  // ==========================================

  editarReceta(id: number): void {

    this.router.navigate([
      '/recetas/editar',
      id
    ]);

  }

  // ==========================================
  // VER DETALLE
  // ==========================================

  verReceta(receta: Receta): void {

    this.recetaSeleccionada = receta;

  }

  // ==========================================
  // CERRAR DETALLE
  // ==========================================

  cerrarDetalle(): void {

    this.recetaSeleccionada = null;

  }

  // ==========================================
  // ELIMINAR RECETA CON SWEETALERT2
  // ==========================================

  async solicitarEliminar(receta: Receta): Promise<void> {

    if (this.eliminando) {
      return;
    }

    // CONFIRMACION CON SWEETALERT2
    const confirmado = await this.alertService.confirm(
      `¿Está seguro de eliminar la receta #${receta.idReceta} del paciente ${receta.paciente}?`
    );

    // SI CANCELA, NO SE ELIMINA
    if (!confirmado) {
      return;
    }

    const id = receta.idReceta;

    this.eliminando = true;
    this.error = '';
    this.mensaje = '';

    // ELIMINAR EN EL BACKEND
    this.http.delete<void>(
      `${this.apiUrl}/${id}`
    ).subscribe({

      next: () => {

        this.eliminando = false;

        // CERRAR EL DETALLE SI ESTABA ABIERTO
        if (
          this.recetaSeleccionada?.idReceta === id
        ) {
          this.recetaSeleccionada = null;
        }

        // MENSAJE DE EXITO
        this.alertService.toast(
          'Receta eliminada correctamente'
        );

        // ACTUALIZAR TABLA
        this.cargarRecetas();

      },

      error: (err: HttpErrorResponse) => {

        console.error(
          'Error al eliminar receta:',
          err
        );

        this.eliminando = false;

        this.alertService.error(
          'No se pudo eliminar la receta'
        );

      }

    });
  }

  // ==========================================
  // IMPRIMIR RECETA
  // ==========================================

  imprimirReceta(receta: Receta): void {

    const ventana = window.open('', '_blank');

    if (!ventana) {

      this.error =
        'El navegador bloqueó la ventana de impresión.';

      return;
    }

    // PROTEGER LOS TEXTOS AL GENERAR EL HTML
    const escapar = (valor: unknown): string =>
      String(valor ?? '').replace(
        /[&<>"']/g,
        caracter => {

          const equivalencias: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
          };

          return equivalencias[caracter];

        }
      );

    // FILAS DE MEDICAMENTOS
    const filas = receta.detalles.map(detalle => `
      <tr>
        <td>${escapar(detalle.medicamento)}</td>
        <td>${escapar(detalle.dosis)}</td>
        <td>${escapar(detalle.indicaciones)}</td>
        <td>${escapar(detalle.cantidad)}</td>
      </tr>
    `).join('');

    // DOCUMENTO PARA IMPRIMIR
    const contenido = `
      <!DOCTYPE html>
      <html lang="es">

      <head>

        <meta charset="UTF-8">

        <title>
          Receta médica ${escapar(receta.idReceta)}
        </title>

        <style>

          body {
            font-family: Arial, sans-serif;
            color: #253e4c;
            margin: 40px;
          }

          h1 {
            color: #075779;
            margin-bottom: 5px;
          }

          .subtitulo {
            color: #718b99;
            margin-bottom: 25px;
          }

          .cabecera {
            border-bottom: 2px solid #075779;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }

          .datos {
            line-height: 1.9;
            margin-bottom: 25px;
          }

          .seccion {
            margin-top: 22px;
          }

          h3 {
            color: #075779;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }

          th,
          td {
            padding: 11px;
            border: 1px solid #d9e5ea;
            text-align: left;
            font-size: 13px;
          }

          th {
            background: #eaf4f8;
            color: #075779;
          }

          .firma {
            margin-top: 90px;
            text-align: center;
          }

          .firma span {
            display: inline-block;
            border-top: 1px solid #555;
            padding: 12px 35px;
          }

          @media print {
            body {
              margin: 20px;
            }
          }

        </style>

      </head>

      <body>

        <div class="cabecera">
          <h1>UPeU Salud</h1>
          <div class="subtitulo">
            Receta médica
          </div>
        </div>

        <div class="datos">

          <div>
            <strong>N.º de receta:</strong>
            ${escapar(receta.idReceta)}
          </div>

          <div>
            <strong>Fecha de emisión:</strong>
            ${escapar(receta.fechaEmision)}
          </div>

          <div>
            <strong>Paciente:</strong>
            ${escapar(receta.paciente)}
          </div>

          <div>
            <strong>Edad:</strong>
            ${
              receta.edad == null
                ? 'No registrada'
                : escapar(receta.edad) + ' años'
            }
          </div>

          <div>
            <strong>Cita:</strong>
            ${escapar(receta.idCita)}
          </div>

        </div>

        <div class="seccion">

          <h3>Diagnóstico</h3>

          <p>
            ${escapar(receta.diagnostico)}
          </p>

        </div>

        <div class="seccion">

          <h3>Tratamiento</h3>

          <p>
            ${escapar(receta.tratamiento)}
          </p>

        </div>

        <div class="seccion">

          <h3>Medicamentos prescritos</h3>

          <table>

            <thead>

              <tr>
                <th>Medicamento</th>
                <th>Dosis</th>
                <th>Indicaciones</th>
                <th>Cantidad</th>
              </tr>

            </thead>

            <tbody>
              ${filas}
            </tbody>

          </table>

        </div>

        <div class="firma">

          <span>
            Firma y sello del médico
          </span>

        </div>

      </body>

      </html>
    `;

    ventana.document.open();
    ventana.document.write(contenido);
    ventana.document.close();

    ventana.onload = () => {
      ventana.focus();
      ventana.print();
    };

  }

  // ==========================================
  // ESTADISTICAS
  // ==========================================

  get totalRecetas(): number {

    return this.recetas.length;

  }

  get totalMedicamentosPrescritos(): number {

    return this.recetas.reduce(
      (total, receta) =>
        total + (receta.detalles?.length ?? 0),
      0
    );

  }

}
