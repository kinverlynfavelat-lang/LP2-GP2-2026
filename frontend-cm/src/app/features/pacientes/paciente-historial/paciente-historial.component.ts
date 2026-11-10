import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CitaService } from '../../../core/services/cita.service';
import { Cita } from '../../../core/interfaces/cita.interface';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-paciente-historial',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './paciente-historial.component.html',
  styleUrl: './paciente-historial.component.css'
})
export class PacienteHistorialComponent implements OnInit {

  private citaService = inject(CitaService);
  private alertService = inject(AlertService);

  // Lista con la última cita de cada paciente (obtenida con SQL GROUP BY en backend)
  pacientesUltimaCita: Cita[] = [];
  pacientesFiltrados: Cita[] = [];

  busqueda: string = '';
  cargando: boolean = false;

  // Estado del modal de historial completo
  mostrarModal: boolean = false;
  pacienteSeleccionado: Cita | null = null;
  historialCitas: Cita[] = [];
  cargandoHistorial: boolean = false;

  ngOnInit(): void {
    this.cargarPacientesConUltimaCita();
  }

  cargarPacientesConUltimaCita(): void {
    this.cargando = true;
    this.citaService.getHistorialPacientes().subscribe({
      next: (data) => {
        this.pacientesUltimaCita = data;
        this.filtrar();
        this.cargando = false;
      },
      error: () => {
        // Fallback defensivo si el endpoint aún no está listo en el servidor
        this.citaService.getCitas().subscribe({
          next: (citas) => {
            const mapa = new Map<number, Cita>();
            for (const c of citas) {
              const id = c.idPersona || (c as any).persona?.idPersona;
              if (id) {
                if (!mapa.has(id) || (c.idCita && mapa.get(id)!.idCita! < c.idCita)) {
                  mapa.set(id, c);
                }
              }
            }
            this.pacientesUltimaCita = Array.from(mapa.values());
            this.filtrar();
            this.cargando = false;
          },
          error: () => {
            this.alertService.error('No se pudo cargar el historial de pacientes');
            this.cargando = false;
          }
        });
      }
    });
  }

  filtrar(): void {
    const texto = this.busqueda.trim().toLowerCase();
    if (!texto) {
      this.pacientesFiltrados = [...this.pacientesUltimaCita];
      return;
    }

    this.pacientesFiltrados = this.pacientesUltimaCita.filter(c => {
      const paciente = c.paciente?.toLowerCase() || '';
      const dni = c.dniPaciente?.toLowerCase() || '';
      const motivo = c.motivoConsulta?.toLowerCase() || '';
      const medico = c.medico?.toLowerCase() || '';
      return paciente.includes(texto) || dni.includes(texto) || motivo.includes(texto) || medico.includes(texto);
    });
  }

  verHistorial(cita: Cita): void {
    this.pacienteSeleccionado = cita;
    this.mostrarModal = true;
    this.cargandoHistorial = true;
    this.historialCitas = [];

    const idPersona = cita.idPersona;
    if (idPersona) {
      this.citaService.getCitasByPaciente(idPersona).subscribe({
        next: (historial) => {
          // Ordenar de la más reciente a la más antigua
          this.historialCitas = [...historial].sort((a, b) => (b.idCita || 0) - (a.idCita || 0));
          this.cargandoHistorial = false;
        },
        error: () => {
          this.alertService.error('No se pudo cargar el historial clínico');
          this.cargandoHistorial = false;
        }
      });
    } else {
      this.historialCitas = [cita];
      this.cargandoHistorial = false;
    }
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.pacienteSeleccionado = null;
    this.historialCitas = [];
  }

  calcularImc(peso: number | null, talla: number | null): string {
    if (!peso || !talla || talla <= 0) return '-';
    const alturaM = talla > 3 ? talla / 100 : talla;
    const imc = peso / (alturaM * alturaM);
    return imc.toFixed(1);
  }

  obtenerClaseEstado(estado: string | null): string {
    const e = (estado || '').toLowerCase();
    if (e.includes('atendido')) return 'badge-atendido';
    if (e.includes('triaje')) return 'badge-triaje';
    if (e.includes('pendiente')) return 'badge-pendiente';
    if (e.includes('anulado')) return 'badge-anulado';
    return 'badge-secondary';
  }
}
