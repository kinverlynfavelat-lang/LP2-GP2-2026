
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MedicoService } from '../../../core/services/medico.service';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { PersonaService } from '../../../core/services/persona.service';
import { AlertService } from '../../../core/services/alert.service';
import { Medico } from '../../../core/interfaces/medico.interfaces';

interface EmpleadoOpcion {
  idPersona: number;
  dni: string;
  nombres: string;
  apellidos: string;
}

@Component({
  selector: 'app-medico-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './medico-form.component.html',
  styleUrl: './medico-form.component.css'
})
export class MedicoFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private medicoService = inject(MedicoService);
  private empleadoService = inject(EmpleadoService);
  private personaService = inject(PersonaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertService = inject(AlertService);

  form: FormGroup;
  id: number | null = null;

  empleados: EmpleadoOpcion[] = [];

  constructor() {

    this.form = this.fb.group({

      idEmpleado: ['', Validators.required],

      especialidad: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],

      codigoCol: ['', [
        Validators.required,
        Validators.maxLength(30)
      ]]

    });

  }

  ngOnInit(): void {

    const parametro = this.route.snapshot.paramMap.get('id');

    this.id = parametro ? Number(parametro) : null;

    this.cargarDatos();

  }

  // Cargar empleados disponibles y médicos registrados
  cargarDatos() {

    forkJoin({
      empleados: this.empleadoService.getEmpleados(),
      personas: this.personaService.getPersonas(),
      medicos: this.medicoService.getMedicos()
    }).subscribe({

      next: (data) => {

        const empleadosRegistrados = data.medicos
          .map(m => m.idEmpleado);

        this.empleados = data.empleados

          // Evitar empleados sin identificador
          .filter(e => e.idPersona != null)

          // Mostrar solamente empleados que todavía no son médicos
          .filter(e => {

            const persona = data.personas.find(
              p => p.idPersona === e.idPersona
            );

            const esEmpleado =
              persona?.tipoPersona === 'EMPLEADO';

            const yaEsMedico =
              empleadosRegistrados.includes(e.idPersona);

            // En edición permitimos conservar al médico actual
            return esEmpleado &&
              (!yaEsMedico || e.idPersona === this.id);

          })

          .map(e => {

            const persona = data.personas.find(
              p => p.idPersona === e.idPersona
            )!;

            return {

              idPersona: e.idPersona!,
              dni: persona.dni,
              nombres: persona.nombres,
              apellidos: persona.apellidos

            };

          });

        // Si estamos editando, cargar información del médico
        if (this.id) {
          this.obtenerMedico(this.id);
        }

      },

      error: (err) => {

        console.error('Error al cargar datos:', err);

        this.alertService.error(
          'No se pudieron cargar los empleados'
        );

      }

    });

  }

  // Obtener médico para editar
  obtenerMedico(id: number) {

    this.medicoService.getMedicoById(id).subscribe({

      next: (data) => {

        this.form.patchValue({

          idEmpleado: data.idEmpleado,
          especialidad: data.especialidad,
          codigoCol: data.codigoCol

        });

        // El empleado asociado no se cambia en la edición
        this.form.get('idEmpleado')?.disable();

      },

      error: (err) => {

        console.error('Error al obtener médico:', err);

        this.alertService.error(
          'No se pudo cargar la información del médico'
        );

        this.router.navigate(['/medicos']);

      }

    });

  }

  // Registrar o actualizar médico
  guardar() {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      this.alertService.error(
        'Complete correctamente los campos obligatorios'
      );

      return;

    }

    const valores = this.form.getRawValue();

    const medico: Medico = {

      idEmpleado: Number(valores.idEmpleado),
      especialidad: valores.especialidad.trim(),
      codigoCol: valores.codigoCol.trim()

    };

    const request = this.id

      ? this.medicoService.updateMedico(this.id, medico)

      : this.medicoService.createMedico(medico);

    request.subscribe({

      next: () => {

        this.alertService.success(

          this.id
            ? 'Médico actualizado correctamente'
            : 'Médico registrado correctamente'

        );

        this.router.navigate(['/medicos']);

      },

      error: (err) => {

        console.error('Error al guardar médico:', err);

        const mensaje = err.error?.message ||
          'Ocurrió un error al guardar el médico';

        this.alertService.error(mensaje);

      }

    });

  }

}
