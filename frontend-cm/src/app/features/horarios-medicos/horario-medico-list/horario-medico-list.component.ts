
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { HorarioMedicoService } from '../../../core/services/horario-medico.service';
import { MedicoService } from '../../../core/services/medico.service';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { PersonaService } from '../../../core/services/persona.service';
import { HorarioMedico } from '../../../core/interfaces/horario-medico.interface';
import { AlertService } from '../../../core/services/alert.service';

interface MedicoOpcion {
  idMedico: number;
  nombre: string;
  especialidad: string;
}

@Component({
  selector: 'app-horario-medico-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './horario-medico-list.component.html',
  styleUrl: './horario-medico-list.component.css'
})
export class HorarioMedicoListComponent implements OnInit {

  private horarioService = inject(HorarioMedicoService);
  private medicoService = inject(MedicoService);
  private empleadoService = inject(EmpleadoService);
  private personaService = inject(PersonaService);
  private alertService = inject(AlertService);

  medicos: MedicoOpcion[] = [];
  horarios: HorarioMedico[] = [];

  medicoSeleccionado: number | null = null;
  cargando = false;

  ngOnInit(): void {
    this.cargarMedicos();
  }

  cargarMedicos(): void {

    forkJoin({
      medicos: this.medicoService.getMedicos(),
      empleados: this.empleadoService.getEmpleados(),
      personas: this.personaService.getPersonas()
    }).subscribe({

      next: (data) => {

        this.medicos = [];

        data.medicos.forEach(medico => {

          const id = medico.idEmpleado;

          if (id == null) {
            return;
          }

          const empleado = data.empleados.find(
            e => e.idPersona === id
          );

          const persona = empleado?.idPersona != null
            ? data.personas.find(
                p => p.idPersona === empleado.idPersona
              )
            : undefined;

          this.medicos.push({
            idMedico: id,
            nombre: persona
              ? `${persona.nombres} ${persona.apellidos}`
              : `Médico #${id}`,
            especialidad: medico.especialidad
          });

        });

        if (this.medicos.length > 0) {
          this.medicoSeleccionado = this.medicos[0].idMedico;
          this.cargarHorarios(this.medicoSeleccionado);
        }

      },

      error: () => {
        this.alertService.error(
          'No se pudieron cargar los médicos'
        );
      }

    });

  }

  cambiarMedico(event: Event): void {

    const valor = (event.target as HTMLSelectElement).value;

    this.medicoSeleccionado = valor ? Number(valor) : null;

    if (this.medicoSeleccionado !== null) {
      this.cargarHorarios(this.medicoSeleccionado);
    } else {
      this.horarios = [];
    }

  }

  cargarHorarios(idMedico: number): void {

    this.cargando = true;

    this.horarioService.getHorariosByMedico(idMedico).subscribe({

      next: (data) => {
        this.horarios = data;
        this.cargando = false;
      },

      error: () => {
        this.horarios = [];
        this.cargando = false;

        this.alertService.error(
          'No se pudieron cargar los horarios'
        );
      }

    });

  }

  obtenerDia(dia: string): string {

    const dias: Record<string, string> = {
      LUNES: 'Lunes',
      MARTES: 'Martes',
      MIERCOLES: 'Miércoles',
      JUEVES: 'Jueves',
      VIERNES: 'Viernes',
      SABADO: 'Sábado'
    };

    return dias[dia] || dia;

  }

  obtenerEstado(estado: string): string {
    return estado === 'ACTIVO' ? 'Activo' : 'Inactivo';
  }

}
