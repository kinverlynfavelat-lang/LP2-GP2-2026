
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';

// ESTADOS OFICIALES DEL BACKEND
type EstadoDerivacion =
  | 'PENDIENTE'
  | 'REALIZADA'
  | 'CANCELADA';

// INTERFAZ DE DERIVACIÓN
interface Derivacion {
  idDerivacion: number;
  fecha: string;
  motivo: string;
  centroDestino: string;
  responsable: string;
  estado: EstadoDerivacion;
  idCita: number;
}

@Component({
  selector: 'app-derivacion-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './derivacion-list.component.html',
  styleUrl: './derivacion-list.component.css'
})
export class DerivacionListComponent implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = '/api/v1/derivaciones';

  // LISTAS
  derivaciones: Derivacion[] = [];
  derivacionesFiltradas: Derivacion[] = [];

  // FILTROS
  busqueda = '';
  filtroEstado = '';

  // ESTADOS DEL BACKEND
  readonly estados: EstadoDerivacion[] = [
    'PENDIENTE',
    'REALIZADA',
    'CANCELADA'
  ];

  // CONTROL DE CARGA
  cargando = false;
  eliminando = false;

  // MENSAJES
  error = '';
  mensaje = '';

  // MODALES
  derivacionSeleccionada: Derivacion | null = null;
  derivacionEliminar: Derivacion | null = null;

  ngOnInit(): void {
    this.cargarDerivaciones();
  }

  // ==========================================
  // LISTAR DERIVACIONES
  // ==========================================

  cargarDerivaciones(): void {
    this.cargando = true;
    this.error = '';

    this.http.get<Derivacion[]>(this.apiUrl).subscribe({
      next: (datos) => {
        this.derivaciones = datos ?? [];
        this.filtrarDerivaciones();
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.error = 'No se pudieron cargar las derivaciones.';
        console.error('Error al listar derivaciones:', err);
      }
    });
  }

  // ==========================================
  // BUSCAR Y FILTRAR DERIVACIONES
  // ==========================================

  filtrarDerivaciones(): void {
    const texto = this.busqueda.trim().toLowerCase();

    this.derivacionesFiltradas = this.derivaciones.filter(
      derivacion => {

        const coincideBusqueda =
          !texto ||
          derivacion.idDerivacion.toString().includes(texto) ||
          derivacion.idCita.toString().includes(texto) ||
          (derivacion.motivo ?? '')
            .toLowerCase()
            .includes(texto) ||
          (derivacion.centroDestino ?? '')
            .toLowerCase()
            .includes(texto) ||
          (derivacion.responsable ?? '')
            .toLowerCase()
            .includes(texto);

        const coincideEstado =
          !this.filtroEstado ||
          derivacion.estado === this.filtroEstado;

        return coincideBusqueda && coincideEstado;
      }
    );
  }

  // ==========================================
  // ESTADOS DISPONIBLES
  // ==========================================

  get estadosDisponibles(): EstadoDerivacion[] {
    return this.estados;
  }

  // ==========================================
  // NAVEGACIÓN
  // ==========================================

  nuevaDerivacion(): void {
    this.router.navigate(['/derivaciones/nuevo']);
  }

  editarDerivacion(id: number): void {
    this.router.navigate(['/derivaciones/editar', id]);
  }

  // ==========================================
  // VER DETALLE
  // ==========================================

  verDerivacion(derivacion: Derivacion): void {
    this.derivacionSeleccionada = derivacion;
  }

  cerrarDetalle(): void {
    this.derivacionSeleccionada = null;
  }

  // ==========================================
  // CONFIRMAR ELIMINACIÓN
  // ==========================================

  solicitarEliminar(derivacion: Derivacion): void {
    this.derivacionEliminar = derivacion;
  }

  cancelarEliminar(): void {
    this.derivacionEliminar = null;
  }

  // ==========================================
  // ELIMINAR DERIVACIÓN
  // ==========================================

  confirmarEliminar(): void {
    if (!this.derivacionEliminar || this.eliminando) {
      return;
    }

    const id = this.derivacionEliminar.idDerivacion;

    this.eliminando = true;
    this.error = '';
    this.mensaje = '';

    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.eliminando = false;
        this.derivacionEliminar = null;

        if (this.derivacionSeleccionada?.idDerivacion === id) {
          this.derivacionSeleccionada = null;
        }

        this.mensaje = 'Derivación eliminada correctamente.';

        this.cargarDerivaciones();
      },
      error: (err: HttpErrorResponse) => {
        this.eliminando = false;
        this.derivacionEliminar = null;

        this.error = 'No se pudo eliminar la derivación.';

        console.error('Error al eliminar derivación:', err);
      }
    });
  }

  // ==========================================
  // ESTADÍSTICAS
  // ==========================================

  get totalDerivaciones(): number {
    return this.derivaciones.length;
  }

  get totalCentrosDestino(): number {
    return new Set(
      this.derivaciones
        .map(derivacion => derivacion.centroDestino)
        .filter(centro => !!centro)
    ).size;
  }

  get totalCitasDerivadas(): number {
    return new Set(
      this.derivaciones
        .map(derivacion => derivacion.idCita)
        .filter(id => id != null)
    ).size;
  }

  // ==========================================
  // FORMATEAR FECHA SIN DESFASE HORARIO
  // ==========================================

  formatearFecha(fecha: string): string {
    if (!fecha) {
      return '-';
    }

    const partes = fecha.split('-');

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
}
