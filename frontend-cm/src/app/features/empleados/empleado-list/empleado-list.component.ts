
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { EmpleadoService } from '../../../core/services/empleado.service';
import { PersonaService } from '../../../core/services/persona.service';
import { AlertService } from '../../../core/services/alert.service';

interface EmpleadoVista {
  idPersona: number;
  dni: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  fechaIngreso: string;
  sueldo: number;
  estado: string;
}

@Component({
  selector: 'app-empleado-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './empleado-list.component.html',
  styleUrl: './empleado-list.component.css'
})
export class EmpleadoListComponent implements OnInit {

  private empleadoService = inject(EmpleadoService);
  private personaService = inject(PersonaService);
  private alertService = inject(AlertService);

  empleados: EmpleadoVista[] = [];
  empleadosFiltrados: EmpleadoVista[] = [];

  busqueda: string = '';
  cargando: boolean = false;
  errorCarga: boolean = false;

  ngOnInit(): void {
    this.listEmpleados();
  }

  // ==========================================
  // LISTAR EMPLEADOS
  // ==========================================

  listEmpleados(): void {

    this.cargando = true;
    this.errorCarga = false;

    forkJoin({
      personas: this.personaService.getPersonas(),
      empleados: this.empleadoService.getEmpleados()
    }).subscribe({

      next: (data) => {

        const resultado: EmpleadoVista[] = [];

        for (const empleado of data.empleados) {

          if (empleado.idPersona == null) {
            continue;
          }

          const persona = data.personas.find(p =>
            p.idPersona === empleado.idPersona &&
            p.tipoPersona === 'EMPLEADO'
          );

          if (persona) {

            resultado.push({
              idPersona: empleado.idPersona,
              dni: persona.dni,
              nombres: persona.nombres,
              apellidos: persona.apellidos,
              correo: persona.correo,
              telefono: persona.telefono,
              fechaIngreso: empleado.fechaIngreso,
              sueldo: empleado.sueldo,
              estado: persona.estado
            });

          }

        }

        this.empleados = resultado;
        this.filtrarEmpleados();
        this.cargando = false;

      },

      error: (err) => {

        console.error('Error al cargar empleados:', err);

        this.errorCarga = true;
        this.cargando = false;

        this.alertService.error(
          'No se pudieron cargar los empleados'
        );

      }

    });

  }

  // ==========================================
  // BUSCAR EMPLEADOS
  // ==========================================

  filtrarEmpleados(): void {

    const texto = this.busqueda.trim().toLowerCase();

    if (!texto) {
      this.empleadosFiltrados = [...this.empleados];
      return;
    }

    this.empleadosFiltrados = this.empleados.filter(e => {

      const dni = (e.dni || '').toLowerCase();
      const nombres = (e.nombres || '').toLowerCase();
      const apellidos = (e.apellidos || '').toLowerCase();

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
  // FORMATEAR FECHA
  // ==========================================

  formatearFecha(
    fecha: string | null | undefined
  ): string {

    if (!fecha) {
      return '-';
    }

    const partes = fecha.substring(0, 10).split('-');

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

}
