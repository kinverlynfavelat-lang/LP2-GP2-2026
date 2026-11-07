
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PersonaService } from '../../../core/services/persona.service';
import { Persona } from '../../../core/interfaces/persona.interface';
import { AlertService } from '../../../core/services/alert.service';
import { FormsModule } from '@angular/forms';

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

  ngOnInit(): void {
    this.listPacientes();
  }

  // Listar pacientes
  listPacientes() {
    this.personaService.getPersonas().subscribe({
      next: (data) => {
        this.pacientes = data.filter(
          p => p.tipoPersona === 'PACIENTE'
        );

        this.filtrarPacientes();
      },
      error: () => {
        this.alertService.error('No se pudieron cargar los pacientes');
      }
    });
  }

  // Buscar por DNI, nombres o apellidos
  filtrarPacientes() {

    const texto = this.busqueda.trim().toLowerCase();

    this.pacientesFiltrados = this.pacientes.filter(p => {

      const dni = p.dni?.toLowerCase() || '';
      const nombres = p.nombres?.toLowerCase() || '';
      const apellidos = p.apellidos?.toLowerCase() || '';

      return dni.includes(texto) ||
             nombres.includes(texto) ||
             apellidos.includes(texto);

    });

  }

  // Eliminar paciente
  async eliminar(id: number) {

    const confirmado = await this.alertService.confirm(
      '¿Está seguro de eliminar este paciente?'
    );

    if (confirmado) {

      this.personaService.deletePersona(id).subscribe({

        next: () => {
          this.alertService.toast('Paciente eliminado correctamente');
          this.listPacientes();
        },

        error: () => {
          this.alertService.error('No se pudo eliminar el paciente');
        }

      });

    }
  }

}
