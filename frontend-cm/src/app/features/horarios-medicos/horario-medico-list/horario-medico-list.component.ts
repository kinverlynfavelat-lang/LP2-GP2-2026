
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, map } from 'rxjs';

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

type HorarioVista = HorarioMedico & {
  medicoId: number;
  medicoNombre: string;
};

@Component({
  selector: 'app-horario-medico-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './horario-medico-list.component.html',
  styleUrl: './horario-medico-list.component.css'
})
export class HorarioMedicoListComponent implements OnInit {

  private horarioService = inject(HorarioMedicoService);
  private medicoService = inject(MedicoService);
  private empleadoService = inject(EmpleadoService);
  private personaService = inject(PersonaService);
  private alertService = inject(AlertService);

  // LISTAS
  medicos: MedicoOpcion[] = [];
  horarios: HorarioVista[] = [];
  horariosFiltrados: HorarioVista[] = [];

  // FILTROS
  medicoSeleccionado: number | null = null;
  busqueda: string = '';

  // CONTROL
  cargando: boolean = false;
  errorCarga: boolean = false;

  ngOnInit(): void {
    this.cargarMedicos();
  }

  // ==========================================
  // CARGAR MEDICOS
  // ==========================================

  cargarMedicos(): void {

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

        const resultado: MedicoOpcion[] = [];

        for (const medico of data.medicos) {

          const id = medico.idEmpleado;

          if (id == null) {
            continue;
          }

          const empleado = data.empleados.find(
            e => e.idPersona === id
          );

          const persona = empleado?.idPersona != null
            ? data.personas.find(
                p => p.idPersona === empleado.idPersona
              )
            : undefined;

          resultado.push({
            idMedico: id,
            nombre: persona
              ? `${persona.nombres} ${persona.apellidos}`
              : `Médico #${id}`,
            especialidad: medico.especialidad
          });

        }

        // ORDENAR MEDICOS POR NOMBRE
        this.medicos = resultado.sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        );

        if (this.medicos.length === 0) {

          this.horarios = [];
          this.horariosFiltrados = [];
          this.cargando = false;

          return;
        }

        // CARGAR LOS HORARIOS DE TODOS
        this.cargarHorarios();

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
  // CARGAR HORARIOS DE TODOS LOS MEDICOS
  // ==========================================

  cargarHorarios(): void {

    if (this.medicos.length === 0) {
      return;
    }

    this.cargando = true;
    this.errorCarga = false;

    const peticiones = this.medicos.map(medico =>

      this.horarioService
        .getHorariosByMedico(medico.idMedico)
        .pipe(

          map((lista: HorarioMedico[]) =>

            lista.map(horario => ({

              ...horario,

              medicoId: medico.idMedico,
              medicoNombre: medico.nombre

            } as HorarioVista))

          )

        )

    );

    forkJoin(peticiones).subscribe({

      next: (resultados) => {

        this.horarios = resultados.flat();

        this.ordenarHorarios();
        this.filtrarHorarios();

        this.cargando = false;

      },

      error: (err) => {

        console.error(
          'Error al cargar horarios:',
          err
        );

        this.horarios = [];
        this.horariosFiltrados = [];

        this.errorCarga = true;
        this.cargando = false;

        this.alertService.error(
          'No se pudieron cargar los horarios médicos'
        );

      }

    });
  }

  // ==========================================
  // ORDENAR POR DIA Y HORA
  // ==========================================

  ordenarHorarios(): void {

    this.horarios.sort((a, b) => {

      const diferenciaDias =
        this.obtenerOrdenDia(a.diaSemana) -
        this.obtenerOrdenDia(b.diaSemana);

      if (diferenciaDias !== 0) {
        return diferenciaDias;
      }

      const diferenciaHoras =
        String(a.horaInicio ?? '').localeCompare(
          String(b.horaInicio ?? '')
        );

      if (diferenciaHoras !== 0) {
        return diferenciaHoras;
      }

      return a.medicoNombre.localeCompare(
        b.medicoNombre
      );

    });
  }

  // ==========================================
  // NORMALIZAR NOMBRE DEL DIA
  // ==========================================

  private normalizarDia(dia: string): string {

    return String(dia ?? '')
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  }

  // ==========================================
  // POSICION DEL DIA EN LA SEMANA
  // ==========================================

  private obtenerOrdenDia(dia: string): number {

    const dias = [
      'LUNES',
      'MARTES',
      'MIERCOLES',
      'JUEVES',
      'VIERNES',
      'SABADO',
      'DOMINGO'
    ];

    const posicion = dias.indexOf(
      this.normalizarDia(dia)
    );

    return posicion === -1
      ? 99
      : posicion;

  }

  // ==========================================
  // CAMBIAR MEDICO
  // ==========================================

  cambiarMedico(event: Event): void {

    const valor =
      (event.target as HTMLSelectElement).value;

    this.medicoSeleccionado = valor === ''
      ? null
      : Number(valor);

    this.filtrarHorarios();

  }

  // ==========================================
  // BUSCAR Y FILTRAR HORARIOS
  // ==========================================

  filtrarHorarios(): void {

    const texto = this.busqueda
      .trim()
      .toLowerCase();

    this.horariosFiltrados = this.horarios.filter(h => {

      const coincideMedico =
        this.medicoSeleccionado === null ||
        h.medicoId === this.medicoSeleccionado;

      const medico =
        h.medicoNombre.toLowerCase();

      const dia =
        this.obtenerDia(h.diaSemana).toLowerCase();

      const inicio =
        String(h.horaInicio ?? '').toLowerCase();

      const fin =
        String(h.horaFin ?? '').toLowerCase();

      const estado =
        String(h.estado ?? '').toLowerCase();

      const coincideBusqueda =
        !texto ||
        medico.includes(texto) ||
        dia.includes(texto) ||
        inicio.includes(texto) ||
        fin.includes(texto) ||
        estado.includes(texto);

      return coincideMedico && coincideBusqueda;

    });
  }

  // ==========================================
  // MOSTRAR DIA
  // ==========================================

  obtenerDia(dia: string): string {

    const dias: Record<string, string> = {
      LUNES: 'Lunes',
      MARTES: 'Martes',
      MIERCOLES: 'Miércoles',
      JUEVES: 'Jueves',
      VIERNES: 'Viernes',
      SABADO: 'Sábado',
      DOMINGO: 'Domingo'
    };

    const clave = this.normalizarDia(dia);

    return dias[clave] || dia;
  }

  // ==========================================
  // MOSTRAR ESTADO
  // ==========================================

  obtenerEstado(estado: string): string {

    return String(estado ?? '')
      .trim()
      .toUpperCase() === 'ACTIVO'
        ? 'ACTIVO'
        : 'INACTIVO';

  }

  // ==========================================
  // ACTUALIZAR LISTADO
  // ==========================================

  actualizar(): void {
    this.cargarMedicos();
  }

}
