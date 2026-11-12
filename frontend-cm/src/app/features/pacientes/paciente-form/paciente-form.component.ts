
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PersonaService } from '../../../core/services/persona.service';
import { Persona } from '../../../core/interfaces/persona.interface';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './paciente-form.component.html',
  styleUrl: './paciente-form.component.css'
})
export class PacienteFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private personaService = inject(PersonaService);
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

      tipoPaciente: ['', Validators.required],

      codigoUniversitario: [''],

      matriculaVigente: [''],

      estado: ['ACTIVO', Validators.required]

    });

    // Validar cuando cambia el tipo de paciente
    this.form.get('tipoPaciente')?.valueChanges.subscribe(tipo => {
      this.validarTipoPaciente(tipo);
    });

  }

  ngOnInit(): void {

    const parametro = this.route.snapshot.paramMap.get('id');

    if (parametro) {

      this.id = Number(parametro);

      this.obtenerPaciente(this.id);

    }

  }

  // Obtener datos del paciente para editar
  obtenerPaciente(id: number) {

    this.personaService.getPersonaById(id).subscribe({

      next: (data) => {

        this.form.patchValue({

          dni: data.dni,
          nombres: data.nombres,
          apellidos: data.apellidos,
          correo: data.correo,
          telefono: data.telefono,
          direccion: data.direccion,
          fechaNacimiento: data.fechaNacimiento,
          estadoCivil: data.estadoCivil,
          alergias: data.alergias,
          tipoPaciente: data.tipoPaciente,
          codigoUniversitario: data.codigoUniversitario,
          matriculaVigente: data.matriculaVigente,
          estado: data.estado

        }, { emitEvent: false });

        this.validarTipoPaciente(data.tipoPaciente);

      },

      error: () => {

        this.alertService.error('No se pudo cargar el paciente');

        this.router.navigate(['/pacientes']);

      }

    });

  }

  // Validar según el tipo de paciente
  validarTipoPaciente(tipo: string | null) {

    const codigo = this.form.get('codigoUniversitario');
    const matricula = this.form.get('matriculaVigente');

    codigo?.clearValidators();
    matricula?.clearValidators();

    if (tipo === 'ESTUDIANTE') {

      codigo?.setValidators([
        Validators.required,
        Validators.maxLength(50)
      ]);

      matricula?.setValidators(Validators.required);

    } else {

      codigo?.setValue('', { emitEvent: false });
      matricula?.setValue('', { emitEvent: false });

    }

    codigo?.updateValueAndValidity();
    matricula?.updateValueAndValidity();

  }

  // Registrar o actualizar paciente
  guardar() {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      this.alertService.error(
        'Complete correctamente los campos obligatorios'
      );

      return;

    }

    const valores = this.form.value;

    const paciente: Persona = {

      dni: valores.dni,

      nombres: valores.nombres,

      apellidos: valores.apellidos,

      correo: valores.correo,

      telefono: valores.telefono,

      direccion: valores.direccion || null,

      fechaNacimiento: valores.fechaNacimiento,

      estadoCivil: valores.estadoCivil,

      alergias: valores.alergias || null,

      tipoPersona: 'PACIENTE',

      tipoPaciente: valores.tipoPaciente,

      codigoUniversitario:
        valores.tipoPaciente === 'ESTUDIANTE'
          ? valores.codigoUniversitario
          : null,

      // El saldo es administrado por el backend
      saldoFondo: null,

      matriculaVigente:
        valores.tipoPaciente === 'ESTUDIANTE'
          ? valores.matriculaVigente
          : null,

      estado: valores.estado,

      idUsuario: null

    };

    // Determinar si registra o actualiza
    const request = this.id
      ? this.personaService.updatePersona(this.id, paciente)
      : this.personaService.createPersona(paciente);

    request.subscribe({

      next: () => {

        this.alertService.success(
          this.id
            ? 'Paciente actualizado correctamente'
            : 'Paciente registrado correctamente'
        );

        this.router.navigate(['/pacientes']);

      },

      error: (err) => {

        const mensaje =
          err.error?.message ||
          err.error?.detail ||
          'Ocurrió un error al guardar el paciente';

        this.alertService.error(mensaje);

      }

    });

  }

}
