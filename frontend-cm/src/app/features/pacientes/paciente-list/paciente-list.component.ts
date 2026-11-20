
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PersonaService } from '../../../core/services/persona.service';
import { Persona } from '../../../core/interfaces/persona.interface';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-paciente-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './paciente-list.component.html',
  styleUrl: './paciente-list.component.css'
})
export class PacienteListComponent implements OnInit {

  private personaService = inject(PersonaService);
  private alertService = inject(AlertService);

  pacientes: Persona[] = [];
  pacientesFiltrados: Persona[] = [];

  busqueda: string = '';
  cargando: boolean = false;
  eliminandoId: number | null = null;

  ngOnInit(): void {
    this.listPacientes();
  }

  // ==========================================
  // LISTAR PACIENTES
  // ==========================================

  listPacientes(): void {

    this.cargando = true;

    this.personaService.getPersonas().subscribe({

      next: (data) => {

        this.pacientes = data.filter(
          p => p.tipoPersona === 'PACIENTE'
        );

        this.filtrarPacientes();
        this.cargando = false;
      },

      error: () => {

        this.cargando = false;

        this.alertService.error(
          'No se pudieron cargar los pacientes'
        );
      }

    });
  }

  // ==========================================
  // BUSCAR PACIENTES
  // ==========================================

  filtrarPacientes(): void {

    const texto = this.busqueda.trim().toLowerCase();

    if (!texto) {
      this.pacientesFiltrados = [...this.pacientes];
      return;
    }

    this.pacientesFiltrados = this.pacientes.filter(p => {

      const dni = p.dni?.toLowerCase() || '';
      const nombres = p.nombres?.toLowerCase() || '';
      const apellidos = p.apellidos?.toLowerCase() || '';

      const nombreCompleto =
        `${nombres} ${apellidos}`.trim();

      return (
        dni.includes(texto) ||
        nombres.includes(texto) ||
        apellidos.includes(texto) ||
        nombreCompleto.includes(texto)
      );

    });
  }

  // ==========================================
  // ELIMINAR PACIENTE
  // ==========================================

  async eliminar(id: number): Promise<void> {

    if (this.eliminandoId !== null) {
      return;
    }

    const confirmado = await this.alertService.confirm(
      '¿Está seguro de eliminar este paciente?'
    );

    if (!confirmado || this.eliminandoId !== null) {
      return;
    }

    this.eliminandoId = id;

    this.personaService.deletePersona(id).subscribe({

      next: () => {

        this.eliminandoId = null;

        this.alertService.toast(
          'Paciente eliminado correctamente'
        );

        this.listPacientes();
      },

      error: () => {

        this.eliminandoId = null;

        this.alertService.error(
          'No se pudo eliminar el paciente'
        );
      }

    });
  }

}
