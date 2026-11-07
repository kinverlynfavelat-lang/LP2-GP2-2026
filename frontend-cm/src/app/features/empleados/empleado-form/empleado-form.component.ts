
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';

import { PersonaService } from '../../../core/services/persona.service';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { Persona } from '../../../core/interfaces/persona.interface';
import { Empleado } from '../../../core/interfaces/empleado.interface';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-empleado-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './empleado-form.component.html',
  styleUrl: './empleado-form.component.css'
})
export class EmpleadoFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private personaService = inject(PersonaService);
  private empleadoService = inject(EmpleadoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertService = inject(AlertService);

  form: FormGroup;
  id: number | null = null;

  constructor() {

    this.form = this.fb.group({

      dni: ['', [
        Validators.required,
        Validators.pattern(/^\d{8}$/)
      ]],

      nombres: ['', [
        Validators.required,
        Validators.maxLength(20)
      ]],

      apellidos: ['', [
        Validators.required,
        Validators.maxLength(20)
      ]],

      correo: ['', [
        Validators.required,
        Validators.email
      ]],

      telefono: ['', Validators.required],

      direccion: [''],

      fechaNacimiento: ['', Validators.required],

      estadoCivil: ['', Validators.required],

      alergias: [''],

      fechaIngreso: ['', Validators.required],

      sueldo: [null, [
        Validators.required,
        Validators.min(0.01)
      ]],

      estado: ['ACTIVO', Validators.required]

    });

  }

  ngOnInit(): void {

    const parametro = this.route.snapshot.paramMap.get('id');

    if (parametro) {
      this.id = Number(parametro);
      this.obtenerEmpleado(this.id);
    }

  }

  // Obtener empleado y sus datos personales
  obtenerEmpleado(id: number) {

    forkJoin({
      persona: this.personaService.getPersonaById(id),
      empleado: this.empleadoService.getEmpleadoById(id)
    }).subscribe({

      next: (data) => {

        if (data.persona.tipoPersona !== 'EMPLEADO') {
          this.alertService.error('La persona no está registrada como empleado');
          this.router.navigate(['/empleados']);
          return;
        }

        this.form.patchValue({

          dni: data.persona.dni,
          nombres: data.persona.nombres,
          apellidos: data.persona.apellidos,
          correo: data.persona.correo,
          telefono: data.persona.telefono,
          direccion: data.persona.direccion,
          fechaNacimiento: data.persona.fechaNacimiento,
          estadoCivil: data.persona.estadoCivil,
          alergias: data.persona.alergias,

          fechaIngreso: data.empleado.fechaIngreso,
          sueldo: data.empleado.sueldo,

          estado: data.persona.estado

        });

      },

      error: (err) => {
        console.error('Error al obtener empleado:', err);
        this.alertService.error('No se pudieron cargar los datos del empleado');
        this.router.navigate(['/empleados']);
      }

    });

  }

  // Registrar o actualizar empleado
  guardar() {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      this.alertService.error(
        'Complete correctamente los campos obligatorios'
      );

      return;

    }

    const valores = this.form.value;

    const persona: Persona = {

      dni: valores.dni,
      nombres: valores.nombres,
      apellidos: valores.apellidos,
      correo: valores.correo,
      telefono: valores.telefono,
      direccion: valores.direccion || null,
      fechaNacimiento: valores.fechaNacimiento,
      estadoCivil: valores.estadoCivil,
      alergias: valores.alergias || null,

      tipoPersona: 'EMPLEADO',
      tipoPaciente: null,
      codigoUniversitario: null,
      saldoFondo: null,
      matriculaVigente: null,

      estado: valores.estado,
      idUsuario: null

    };

    const empleado: Empleado = {

      idPersona: this.id ?? undefined,
      fechaIngreso: valores.fechaIngreso,
      sueldo: Number(valores.sueldo)

    };

    // ACTUALIZAR
    if (this.id) {

      forkJoin({
        persona: this.personaService.updatePersona(this.id, persona),
        empleado: this.empleadoService.updateEmpleado(this.id, empleado)
      }).subscribe({

        next: () => {

          this.alertService.success(
            'Empleado actualizado correctamente'
          );

          this.router.navigate(['/empleados']);

        },

        error: (err) => {

          console.error('Error al actualizar:', err);

          const mensaje = err.error?.message ||
            'Ocurrió un error al actualizar el empleado';

          this.alertService.error(mensaje);

        }

      });

    } else {

      // REGISTRAR PRIMERO LA PERSONA
      this.personaService.createPersona(persona).pipe(

        // DESPUÉS REGISTRAR EL EMPLEADO
        switchMap((personaGuardada) => {

          if (!personaGuardada.idPersona) {
            throw new Error('No se recibió el ID de la persona registrada');
          }

          const nuevoEmpleado: Empleado = {
            idPersona: personaGuardada.idPersona,
            fechaIngreso: valores.fechaIngreso,
            sueldo: Number(valores.sueldo)
          };

          return this.empleadoService.createEmpleado(nuevoEmpleado);

        })

      ).subscribe({

        next: () => {

          this.alertService.success(
            'Empleado registrado correctamente'
          );

          this.router.navigate(['/empleados']);

        },

        error: (err) => {

          console.error('Error al registrar:', err);

          const mensaje = err.error?.message ||
            err.message ||
            'Ocurrió un error al registrar el empleado';

          this.alertService.error(mensaje);

        }

      });

    }

  }

}
