
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { MedicoService } from '../../../core/services/medico.service';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { PersonaService } from '../../../core/services/persona.service';
import { AlertService } from '../../../core/services/alert.service';

interface MedicoVista {
  idEmpleado: number;
  dni: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  especialidad: string;
  codigoCol: string;
}

@Component({
  selector: 'app-medico-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './medico-list.component.html',
  styleUrl: './medico-list.component.css'
})
export class MedicoListComponent implements OnInit {

  private medicoService = inject(MedicoService);
  private empleadoService = inject(EmpleadoService);
  private personaService = inject(PersonaService);
  private alertService = inject(AlertService);

  medicos: MedicoVista[] = [];
  medicosFiltrados: MedicoVista[] = [];

  busqueda: string = '';

  ngOnInit(): void {
    this.listMedicos();
  }

  // Listar médicos combinando los tres servicios
  listMedicos() {

    forkJoin({
      medicos: this.medicoService.getMedicos(),
      empleados: this.empleadoService.getEmpleados(),
      personas: this.personaService.getPersonas()
    }).subscribe({

      next: (data) => {

        const resultado: MedicoVista[] = [];

        for (const medico of data.medicos) {

          if (medico.idEmpleado == null) {
            continue;
          }

          const empleado = data.empleados.find(
            e => e.idPersona === medico.idEmpleado
          );

          if (!empleado) {
            continue;
          }

          const persona = data.personas.find(
            p => p.idPersona === empleado.idPersona
          );

          if (persona) {

            resultado.push({

              idEmpleado: medico.idEmpleado,
              dni: persona.dni,
              nombres: persona.nombres,
              apellidos: persona.apellidos,
              correo: persona.correo,
              telefono: persona.telefono,
              especialidad: medico.especialidad,
              codigoCol: medico.codigoCol

            });

          }

        }

        this.medicos = resultado;
        this.filtrarMedicos();

      },

      error: (err) => {
        console.error('Error al cargar médicos:', err);
        this.alertService.error('No se pudieron cargar los médicos');
      }

    });

  }

  // Buscar por DNI, nombres, apellidos o especialidad
  filtrarMedicos() {

    const texto = this.busqueda.trim().toLowerCase();

    this.medicosFiltrados = this.medicos.filter(m => {

      return (
        m.dni.toLowerCase().includes(texto) ||
        m.nombres.toLowerCase().includes(texto) ||
        m.apellidos.toLowerCase().includes(texto) ||
        m.especialidad.toLowerCase().includes(texto) ||
        m.codigoCol.toLowerCase().includes(texto)
      );

    });

  }

}
