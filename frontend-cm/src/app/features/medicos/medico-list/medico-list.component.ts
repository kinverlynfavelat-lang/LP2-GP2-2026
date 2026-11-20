
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { MedicoService } from '../../../core/services/medico.service';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { PersonaService } from '../../../core/services/persona.service';
import { AlertService } from '../../../core/services/alert.service';
import { CitaService } from '../../../core/services/cita.service';

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
  private citaService = inject(CitaService);
  private alertService = inject(AlertService);

  medicos: MedicoVista[] = [];
  medicosFiltrados: MedicoVista[] = [];

  productividadMap = new Map<number, number>();

  busqueda: string = '';
  cargando: boolean = false;
  errorCarga: boolean = false;

  ngOnInit(): void {
    this.listMedicos();
    this.cargarProductividad();
  }

  // ==========================================
  // PRODUCTIVIDAD DE MEDICOS
  // ==========================================

  cargarProductividad(): void {

    this.citaService.getProductividadMedicos().subscribe({

      next: (lista) => {

        this.productividadMap.clear();

        lista.forEach(p => {
          this.productividadMap.set(
            p.idMedico,
            p.totalCitas
          );
        });

      },

      error: (err) => {
        console.error(
          'No se pudo cargar la productividad médica:',
          err
        );
      }

    });
  }

  obtenerTotalCitas(idMedico: number): number {
    return this.productividadMap.get(idMedico) || 0;
  }

  // ==========================================
  // LISTAR MEDICOS
  // ==========================================

  listMedicos(): void {

    if (this.cargando) {
      return;
    }

    this.cargando = true;
    this.errorCarga = false;

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
        this.cargando = false;

      },

      error: (err) => {

        console.error(
          'Error al cargar médicos:',
          err
        );

        this.errorCarga = true;
        this.cargando = false;

        this.alertService.error(
          'No se pudieron cargar los médicos'
        );

      }

    });
  }

  // ==========================================
  // BUSCAR MEDICOS
  // ==========================================

  filtrarMedicos(): void {

    const texto = this.busqueda.trim().toLowerCase();

    if (!texto) {
      this.medicosFiltrados = [...this.medicos];
      return;
    }

    this.medicosFiltrados = this.medicos.filter(m => {

      const dni = (m.dni || '').toLowerCase();
      const nombres = (m.nombres || '').toLowerCase();
      const apellidos = (m.apellidos || '').toLowerCase();
      const especialidad = (m.especialidad || '').toLowerCase();
      const colegiatura = (m.codigoCol || '').toLowerCase();

      const nombreCompleto =
        `${nombres} ${apellidos}`.trim();

      return (
        dni.includes(texto) ||
        nombres.includes(texto) ||
        apellidos.includes(texto) ||
        nombreCompleto.includes(texto) ||
        especialidad.includes(texto) ||
        colegiatura.includes(texto)
      );

    });
  }

}
