
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
  selector: 'app-horario-medico-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './horario-medico-form.component.html',
  styleUrl: './horario-medico-form.component.css'
})
export class HorarioMedicoFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private horarioService = inject(HorarioMedicoService);
  private medicoService = inject(MedicoService);
  private empleadoService = inject(EmpleadoService);
  private personaService = inject(PersonaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertService = inject(AlertService);

  form: FormGroup;
  id: number | null = null;

  medicos: MedicoOpcion[] = [];

  diasSemana = [
    { valor: 'LUNES', nombre: 'Lunes' },
    { valor: 'MARTES', nombre: 'Martes' },
    { valor: 'MIERCOLES', nombre: 'Miércoles' },
    { valor: 'JUEVES', nombre: 'Jueves' },
    { valor: 'VIERNES', nombre: 'Viernes' },
    { valor: 'SABADO', nombre: 'Sábado' }
  ];

  estados = [
    { valor: 'ACTIVO', nombre: 'Activo' },
    { valor: 'INACTIVO', nombre: 'Inactivo' }
  ];

  constructor() {

    this.form = this.fb.group({

      idMedico: ['', Validators.required],

      diaSemana: ['', Validators.required],

      horaInicio: ['', Validators.required],

      horaFin: ['', Validators.required],

      estado: ['ACTIVO', Validators.required]

    });

  }

  ngOnInit(): void {

    const parametro = this.route.snapshot.paramMap.get('id');

    this.id = parametro ? Number(parametro) : null;

    this.cargarMedicos();

  }

  // Cargar médicos disponibles
  cargarMedicos(): void {

    this.medicoService.getMedicos().subscribe({

      next: (medicos) => {

        this.empleadoService.getEmpleados().subscribe({

          next: (empleados) => {

            this.personaService.getPersonas().subscribe({

              next: (personas) => {

                this.medicos = [];

                medicos.forEach(medico => {

                  const id = medico.idEmpleado;

                  if (id == null) {
                    return;
                  }

                  const empleado = empleados.find(
                    e => e.idPersona === id
                  );

                  const persona = empleado?.idPersona != null
                    ? personas.find(
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

                if (this.id) {
                  this.obtenerHorario(this.id);
                }

              },

              error: () => {
                this.alertService.error(
                  'No se pudieron cargar las personas'
                );
              }

            });

          },

          error: () => {
            this.alertService.error(
              'No se pudieron cargar los empleados'
            );
          }

        });

      },

      error: () => {
        this.alertService.error(
          'No se pudieron cargar los médicos'
        );
      }

    });

  }

  // Obtener horario para editar
  obtenerHorario(id: number): void {

    this.horarioService.getHorarioById(id).subscribe({

      next: (data) => {

        this.form.patchValue({
          idMedico: data.idMedico,
          diaSemana: data.diaSemana,
          horaInicio: data.horaInicio,
          horaFin: data.horaFin,
          estado: data.estado
        });

        // No cambiar el médico asociado al horario
        this.form.get('idMedico')?.disable();

      },

      error: () => {

        this.alertService.error(
          'No se pudo cargar el horario médico'
        );

        this.router.navigate(['/horarios-medicos']);

      }

    });

  }

  // Validar horas
  validarHoras(): boolean {

    const inicio = this.form.get('horaInicio')?.value;
    const fin = this.form.get('horaFin')?.value;

    if (!inicio || !fin) {
      return true;
    }

    return inicio < fin;

  }

  // Guardar horario
  guardar(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      this.alertService.error(
        'Complete correctamente los campos obligatorios'
      );

      return;

    }

    if (!this.validarHoras()) {

      this.alertService.error(
        'La hora de inicio debe ser anterior a la hora de fin'
      );

      return;

    }

    const valores = this.form.getRawValue();

    const horario: HorarioMedico = {

      idMedico: Number(valores.idMedico),
      diaSemana: valores.diaSemana,
      horaInicio: valores.horaInicio,
      horaFin: valores.horaFin,
      estado: valores.estado

    };

    const request = this.id
      ? this.horarioService.updateHorario(this.id, horario)
      : this.horarioService.createHorario(horario);

    request.subscribe({

      next: () => {

        this.alertService.success(
          this.id
            ? 'Horario actualizado correctamente'
            : 'Horario registrado correctamente'
        );

        this.router.navigate(['/horarios-medicos']);

      },

      error: (err) => {

        console.error('Error al guardar horario:', err);

        const mensaje = err.error?.message ||
          err.error?.detail ||
          'Ocurrió un error al guardar el horario';

        this.alertService.error(mensaje);

      }

    });

  }

}
