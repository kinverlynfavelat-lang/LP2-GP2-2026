
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import { forkJoin } from 'rxjs';
import { OfflineDbService } from '../../../core/offline/db.service';
import { NetworkService } from '../../../core/offline/network.service';
import { OfflineOperationsService } from '../../../core/offline/offline-operations.service';

interface Cita {
  idCita: number;
  fechaCita: string;
  horaCita: string;
  paciente: string;
  medico: string;
  diagnostico: string | null;
  tratamiento: string | null;
  estado: string;
}

interface Medicamento {
  idMedicamento: number;
  nombre: string;
  descripcion: string | null;
  stock: number;
  precio: number;
  estado: string;
}

interface DetalleReceta {
  idMedicamento: number | null;
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
  detalles: {
    idDetalleReceta: number;
    idMedicamento: number;
    medicamento: string;
    dosis: string;
    indicaciones: string;
    cantidad: number;
  }[];
}

interface RecetaRequest {
  idCita: number;
  detalles: {
    idMedicamento: number;
    dosis: string;
    indicaciones: string;
    cantidad: number;
  }[];
}

@Component({
  selector: 'app-receta-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receta-form.component.html',
  styleUrl: './receta-form.component.css'
})
export class RecetaFormComponent implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private offlineDb = inject(OfflineDbService);
  private network = inject(NetworkService);
  private offlineOps = inject(OfflineOperationsService);

  private api = '/api/v1';

  idReceta: number | null = null;
  modoEdicion = false;

  citas: Cita[] = [];
  medicamentos: Medicamento[] = [];

  idCitaSeleccionada: number | null = null;
  citaSeleccionada: Cita | null = null;

  detalles: DetalleReceta[] = [];

  cargando = false;
  guardando = false;

  error = '';
  mensaje = '';

  ngOnInit(): void {
    const parametro = this.route.snapshot.paramMap.get('id');

    if (parametro !== null) {
      const id = Number(parametro);

      if (!Number.isInteger(id) || id <= 0) {
        this.error = 'El identificador de la receta no es válido.';
        return;
      }

      this.idReceta = id;
      this.modoEdicion = true;
    }

    this.cargarDatos();
  }

  

  // CARGAR CITAS Y MEDICAMENTOS

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    if (!this.network.isOnline()) {
      this.cargarDatosDesdeCache();
      return;
    }

    forkJoin({
      citas: this.http.get<Cita[]>(`${this.api}/citas`),
      medicamentos: this.http.get<Medicamento[]>(
        `${this.api}/medicamentos`
      )
    }).subscribe({
      next: ({ citas, medicamentos }) => {
        this.citas = citas ?? [];
        this.medicamentos = medicamentos ?? [];

        if (this.modoEdicion && this.idReceta !== null) {
          this.cargarReceta(this.idReceta);
        } else {
          this.agregarMedicamento();
          this.cargando = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.warn('Error al cargar datos de receta, usando IndexedDB:', err);
        this.cargarDatosDesdeCache();
      }
    });
  }
  private async cargarDatosDesdeCache(): Promise<void> {
    try {
      const [citasLocales, medicamentosLocales] = await Promise.all([
        this.offlineDb.citasLocales.toArray(),
        this.offlineDb.medicamentos.toArray()
      ]);

      this.citas = citasLocales
        .filter(c => c.idCita != null)
        .map(c => ({
          idCita: c.idCita!,
          fechaCita: c.fechaCita,
          horaCita: c.horaCita,
          paciente: c.paciente || `Paciente #${c.idPersona}`,
          medico: c.medico || '',
          diagnostico: c.diagnostico,
          tratamiento: c.tratamiento,
          estado: c.estado || ''
        }));

      this.medicamentos = medicamentosLocales
        .filter(m => m.idMedicamento != null)
        .map(m => ({
          idMedicamento: m.idMedicamento!,
          nombre: m.nombre,
          descripcion: m.descripcion,
          stock: m.stock,
          precio: m.precio,
          estado: m.estado
        }));

      this.agregarMedicamento();
      this.cargando = false;
    } catch (err) {
      this.cargando = false;
      this.error = 'No se pudieron cargar las citas o medicamentos desde caché local.';
      console.error(err);
    }
  }

  // CITAS APTAS PARA EMITIR RECETA

  get citasDisponibles(): Cita[] {
    return this.citas.filter(cita => {
      const tieneDiagnostico = !!cita.diagnostico?.trim();
      const tieneTratamiento = !!cita.tratamiento?.trim();
      const noDerivada = cita.estado !== 'DERIVADO';

      return (
        tieneDiagnostico &&
        tieneTratamiento &&
        noDerivada
      );
    });
  }

  // SELECCIONAR CITA

  seleccionarCita(): void {
    this.citaSeleccionada =
      this.citas.find(
        cita => cita.idCita === Number(this.idCitaSeleccionada)
      ) ?? null;

    this.error = '';
  }

  // CARGAR RECETA PARA EDITAR

  cargarReceta(id: number): void {
    this.http.get<Receta>(`${this.api}/recetas/${id}`)
      .subscribe({
        next: receta => {
          this.idCitaSeleccionada = receta.idCita;
          this.seleccionarCita();

          this.detalles = (receta.detalles ?? []).map(
            detalle => ({
              idMedicamento: detalle.idMedicamento,
              dosis: detalle.dosis,
              indicaciones: detalle.indicaciones,
              cantidad: detalle.cantidad
            })
          );

          if (this.detalles.length === 0) {
            this.agregarMedicamento();
          }

          this.cargando = false;
        },
        error: (err: HttpErrorResponse) => {
          this.cargando = false;
          this.error = 'No se pudo cargar la receta seleccionada.';
          console.error('Error al cargar receta:', err);
        }
      });
  }

  // AGREGAR FILA DE MEDICAMENTO

  agregarMedicamento(): void {
    this.detalles.push({
      idMedicamento: null,
      dosis: '',
      indicaciones: '',
      cantidad: 1
    });
  }

  // QUITAR FILA DE MEDICAMENTO

  quitarMedicamento(indice: number): void {
    if (this.detalles.length <= 1) {
      this.error =
        'La receta debe contener al menos un medicamento.';
      return;
    }

    this.detalles.splice(indice, 1);
    this.error = '';
  }

  // OBTENER MEDICAMENTO

  obtenerMedicamento(id: number | null): Medicamento | undefined {
    return this.medicamentos.find(
      medicamento => medicamento.idMedicamento === Number(id)
    );
  }

  // MOSTRAR STOCK

  obtenerStock(id: number | null): number | null {
    const medicamento = this.obtenerMedicamento(id);
    return medicamento ? medicamento.stock : null;
  }

  // VALIDAR FORMULARIO

  validarFormulario(): boolean {
    if (this.idCitaSeleccionada === null) {
      this.error = 'Selecciona una cita médica.';
      return false;
    }

    if (!this.citaSeleccionada) {
      this.error = 'La cita seleccionada no existe.';
      return false;
    }

    if (
      !this.citaSeleccionada.diagnostico?.trim() ||
      !this.citaSeleccionada.tratamiento?.trim()
    ) {
      this.error =
        'La cita debe tener diagnóstico y tratamiento.';
      return false;
    }

    if (this.citaSeleccionada.estado === 'DERIVADO') {
      this.error =
        'No se puede emitir una receta para una cita derivada.';
      return false;
    }

    if (this.detalles.length === 0) {
      this.error = 'Agrega al menos un medicamento.';
      return false;
    }

    for (let i = 0; i < this.detalles.length; i++) {
      const detalle = this.detalles[i];

      if (detalle.idMedicamento === null) {
        this.error =
          `Selecciona el medicamento de la fila ${i + 1}.`;
        return false;
      }

      if (!this.obtenerMedicamento(detalle.idMedicamento)) {
        this.error =
          `El medicamento de la fila ${i + 1} no existe.`;
        return false;
      }

      if (!detalle.dosis.trim()) {
        this.error =
          `Ingresa la dosis de la fila ${i + 1}.`;
        return false;
      }

      if (!detalle.indicaciones.trim()) {
        this.error =
          `Ingresa las indicaciones de la fila ${i + 1}.`;
        return false;
      }

      if (
        !Number.isInteger(Number(detalle.cantidad)) ||
        Number(detalle.cantidad) < 1
      ) {
        this.error =
          `La cantidad de la fila ${i + 1} debe ser mayor a cero.`;
        return false;
      }
    }

    return true;
  }

  // GUARDAR O ACTUALIZAR RECETA

  guardarReceta(): void {
    this.error = '';
    this.mensaje = '';

    if (this.guardando || !this.validarFormulario()) {
      return;
    }

    const datos: RecetaRequest = {
      idCita: Number(this.idCitaSeleccionada),
      detalles: this.detalles.map(detalle => ({
        idMedicamento: Number(detalle.idMedicamento),
        dosis: detalle.dosis.trim(),
        indicaciones: detalle.indicaciones.trim(),
        cantidad: Number(detalle.cantidad)
      }))
    };

    this.guardando = true;

    const resumen = `Receta Cita #${datos.idCita} (${this.citaSeleccionada?.paciente || 'Paciente'}) - ${datos.detalles.length} med.`;
    const idEditar = this.modoEdicion && this.idReceta !== null ? this.idReceta : null;

    this.offlineOps.guardarReceta(datos, resumen, idEditar)
      .then(res => {
        this.guardando = false;
        if (res.offline) {
          this.mensaje =
            'Sin conexión: la receta se guardó en la cola local (FIFO) y se sincronizará al volver el internet.';
          setTimeout(() => this.router.navigate(['/sincronizacion']), 1200);
        } else {
          this.router.navigate(['/recetas']);
        }
      })
      .catch((err: HttpErrorResponse) => {
        this.guardando = false;
        this.error =
          typeof err?.error?.message === 'string'
            ? err.error.message
            : 'No se pudo guardar la receta médica.';
        console.error('Error al guardar receta:', err);
      });
  }

  // CANCELAR

  cancelar(): void {
    this.router.navigate(['/recetas']);
  }

  // TÍTULO DINÁMICO

  get tituloFormulario(): string {
    return this.modoEdicion
      ? 'Editar receta médica'
      : 'Nueva receta médica';
  }
}
