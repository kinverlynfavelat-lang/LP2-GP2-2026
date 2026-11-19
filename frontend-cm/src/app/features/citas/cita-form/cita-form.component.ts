
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { CitaService } from '../../../core/services/cita.service';
import { PersonaService } from '../../../core/services/persona.service';
import { MedicoService } from '../../../core/services/medico.service';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { Cita } from '../../../core/interfaces/cita.interface';
import { AlertService } from '../../../core/services/alert.service';
import { OfflineDbService } from '../../../core/offline/db.service';
import { NetworkService } from '../../../core/offline/network.service';
import { OfflineOperationsService } from '../../../core/offline/offline-operations.service';

interface PacienteOpcion {
  idPersona: number;
  dni: string;
  nombres: string;
  apellidos: string;
}

interface MedicoOpcion {
  idEmpleado: number;
  nombres: string;
  apellidos: string;
  especialidad: string;
}

interface EmpleadoOpcion {
  idPersona: number;
  nombres: string;
  apellidos: string;
}

interface Derivacion {
  idDerivacion: number;
  fecha: string;
  motivo: string;
  centroDestino: string;
  responsable: string;
  estado: string;
  idCita: number;
}

@Component({
  selector: 'app-cita-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cita-form.component.html',
  styleUrl: './cita-form.component.css'
})
export class CitaFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private citaService = inject(CitaService);
  private personaService = inject(PersonaService);
  private medicoService = inject(MedicoService);
  private empleadoService = inject(EmpleadoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertService = inject(AlertService);
  private offlineDb = inject(OfflineDbService);
  private network = inject(NetworkService);
  private offlineOps = inject(OfflineOperationsService);

  private derivacionApi = '/api/v1/derivaciones';

  form: FormGroup;
  id: number | null = null;

  pacientes: PacienteOpcion[] = [];
  medicos: MedicoOpcion[] = [];
  empleados: EmpleadoOpcion[] = [];

  guardando = false;

  constructor() {
    this.form = this.fb.group({

      idPersona: ['', Validators.required],
      idMedico: ['', Validators.required],
      idEmpleado: [''],

      fechaCita: ['', Validators.required],
      horaCita: ['', Validators.required],

      notificacion: ['N', Validators.required],

      motivoConsulta: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],

      estado: ['RECEPCION', Validators.required],

      // Datos adicionales de derivación
      motivoDerivacion: [''],
      centroDestino: [''],
      responsable: ['']

    });

    this.form.get('estado')?.valueChanges.subscribe(estado => {
      this.configurarValidacionesDerivacion(estado);
    });
  }

  ngOnInit(): void {

    const parametro = this.route.snapshot.paramMap.get('id');

    this.id = parametro ? Number(parametro) : null;

    this.cargarDatos();

  }

  // VALIDACIONES SEGÚN ESTADO

  configurarValidacionesDerivacion(estado: string): void {

    const campos = [
      'motivoDerivacion',
      'centroDestino',
      'responsable'
    ];

    campos.forEach(nombre => {
      const control = this.form.get(nombre);

      if (estado === 'DERIVADO') {
        control?.setValidators([
          Validators.required,
          Validators.maxLength(200)
        ]);
      } else {
        control?.clearValidators();
        control?.setValue('');
      }

      control?.updateValueAndValidity();
    });

  }

  // CARGAR DATOS (con respaldo automático en IndexedDB si no hay internet)

  cargarDatos(): void {
    if (!this.network.isOnline()) {
      this.cargarDatosDesdeCache();
      return;
    }

    forkJoin({
      personas: this.personaService.getPersonas(),
      empleados: this.empleadoService.getEmpleados(),
      medicos: this.medicoService.getMedicos()
    }).subscribe({

      next: (data) => {
        this.mapearCatalogos(data.personas, data.empleados, data.medicos);

        if (this.id) {
          this.obtenerCita(this.id);
        }
      },

      error: (err) => {
        console.warn('Sin conexión al servidor, cargando catálogos desde IndexedDB:', err);
        this.cargarDatosDesdeCache();
      }

    });

  }

  private async cargarDatosDesdeCache(): Promise<void> {
    try {
      const [personas, empleados, medicos] = await Promise.all([
        this.offlineDb.personas.toArray(),
        this.offlineDb.empleados.toArray(),
        this.offlineDb.medicos.toArray()
      ]);

      this.mapearCatalogos(personas, empleados, medicos);

      if (personas.length === 0) {
        this.alertService.error(
          'Modo sin conexión: no hay catálogos en caché local todavía.'
        );
      }
    } catch (err) {
      console.error('Error al leer IndexedDB:', err);
      this.alertService.error('No se pudieron cargar los datos del formulario');
    }
  }

  private mapearCatalogos(personas: any[], empleados: any[], medicos: any[]): void {
    this.pacientes = personas
      .filter(p =>
        p.idPersona != null &&
        p.tipoPersona === 'PACIENTE'
      )
      .map(p => ({
        idPersona: p.idPersona!,
        dni: p.dni,
        nombres: p.nombres,
        apellidos: p.apellidos
      }));

    this.empleados = empleados
      .filter(e => e.idPersona != null)
      .map(e => {
        const persona = personas.find(p => p.idPersona === e.idPersona);
        return {
          idPersona: e.idPersona!,
          nombres: persona?.nombres || '',
          apellidos: persona?.apellidos || ''
        };
      })
      .filter(e => e.nombres !== '');

    this.medicos = medicos
      .filter(m => m.idEmpleado != null)
      .map(m => {
        const persona = personas.find(p => p.idPersona === m.idEmpleado);
        return {
          idEmpleado: m.idEmpleado!,
          nombres: persona?.nombres || '',
          apellidos: persona?.apellidos || '',
          especialidad: m.especialidad
        };
      })
      .filter(m => m.nombres !== '');

  }


  // OBTENER CITA

  obtenerCita(id: number): void {

    this.citaService.getCitaById(id).subscribe({

      next: (data) => {

        this.form.patchValue({

          idPersona: data.idPersona,
          idMedico: data.idMedico,
          idEmpleado: data.idEmpleado ?? '',

          fechaCita: data.fechaCita,
          horaCita: data.horaCita,

          notificacion: data.notificacion || 'N',

          motivoConsulta: data.motivoConsulta,
          estado: data.estado || 'RECEPCION'

        });

        // Recuperar datos de derivación si corresponde
        if (data.estado === 'DERIVADO') {
          this.cargarDatosDerivacion(id);
        }

      },

      error: (err) => {

        console.error('Error al obtener cita:', err);

        this.alertService.error(
          'No se pudo cargar la información de la cita'
        );

        this.router.navigate(['/citas']);

      }

    });

  }

  cargarDatosDerivacion(idCita: number): void {

    this.http.get<Derivacion[]>(
      `${this.derivacionApi}/cita/${idCita}`
    ).subscribe({

      next: (derivaciones) => {

        const derivacion = derivaciones?.[0];

        if (derivacion) {

          this.form.patchValue({

            motivoDerivacion: derivacion.motivo,
            centroDestino: derivacion.centroDestino,
            responsable: derivacion.responsable

          });

        }

      },

      error: (err) => {
        console.error('Error al recuperar derivación:', err);
      }

    });

  }

  // GUARDAR CITA

  guardar(): void {

    if (this.form.invalid || this.guardando) {

      this.form.markAllAsTouched();

      this.alertService.error(
        'Complete correctamente los campos obligatorios'
      );

      return;

    }

    const valores = this.form.getRawValue();

    const estado = valores.estado;

    const cita: Cita = {

      idPersona: Number(valores.idPersona),

      idMedico: Number(valores.idMedico),

      idEmpleado: valores.idEmpleado
        ? Number(valores.idEmpleado)
        : null,

      fechaCita: valores.fechaCita,

      horaCita: valores.horaCita,

      notificacion: valores.notificacion,

      motivoConsulta: valores.motivoConsulta.trim(),

      temperatura: null,
      presion: null,
      frecuenciaCardiaca: null,
      frecuenciaRespiratoria: null,

      peso: null,
      talla: null,

      diagnostico: null,
      tratamiento: null,
      observaciones: null,
      indicaciones: null,

      estado: estado

    };

    this.guardando = true;

    if (this.id) {

      this.citaService.updateCita(this.id, cita).subscribe({

        next: () => {

          if (estado === 'DERIVADO') {
            this.guardarDatosDerivacion(this.id!);
          } else {
            this.finalizarGuardado();
          }

        },

        error: (err) => {
          this.errorGuardar(err);
        }

      });

    } else {

      const pac = this.pacientes.find(p => p.idPersona === cita.idPersona);
      const nombrePaciente = pac ? `${pac.nombres} ${pac.apellidos}` : undefined;

      this.offlineOps.guardarCita(cita, nombrePaciente)
        .then(res => {
          if (res.offline) {
            this.guardando = false;
            this.alertService.success(
              'Sin conexión: la cita se guardó localmente (pendiente_sincronizacion) y se enviará al volver el internet.'
            );
            this.router.navigate(['/sincronizacion']);
            return;
          }

          if (estado === 'DERIVADO') {
            if (!res.idCita) {
              this.guardando = false;
              this.alertService.error(
                'La cita se registró, pero no se recibió su identificador. Verifica el listado antes de continuar.'
              );
              return;
            }
            this.guardarDatosDerivacion(res.idCita);
          } else {
            this.finalizarGuardado();
          }
        })
        .catch(err => {
          if (err instanceof Error && !('error' in err)) {
            this.guardando = false;
            this.alertService.error(err.message);
          } else {
            this.errorGuardar(err);
          }
        });

    }

  }

  // REGISTRAR O ACTUALIZAR DERIVACIÓN

  guardarDatosDerivacion(idCita: number): void {

    const valores = this.form.getRawValue();

    const datos = {

      fecha: valores.fechaCita,

      motivo: valores.motivoDerivacion.trim(),

      centroDestino: valores.centroDestino.trim(),

      responsable: valores.responsable.trim(),

      estado: 'PENDIENTE',

      idCita: idCita

    };

    this.http.get<Derivacion[]>(
      `${this.derivacionApi}/cita/${idCita}`
    ).subscribe({

      next: (derivaciones) => {

        const existente = derivaciones?.[0];

        const peticion = existente
          ? this.http.put(
            `${this.derivacionApi}/${existente.idDerivacion}`,
            {
              ...datos,
              idDerivacion: existente.idDerivacion
            }
          )
          : this.http.post(
            this.derivacionApi,
            datos
          );

        peticion.subscribe({

          next: () => {
            this.finalizarGuardado();
          },

          error: (err) => {
            this.errorGuardar(err);
          }

        });

      },

      error: (err) => {
        this.errorGuardar(err);
      }

    });

  }

  // FINALIZAR

  finalizarGuardado(): void {

    this.guardando = false;

    this.alertService.success(
      this.id
        ? 'Cita actualizada correctamente'
        : 'Cita registrada correctamente'
    );

    this.router.navigate(['/citas']);

  }

  errorGuardar(err: any): void {

    console.error('Error al guardar cita o derivación:', err);

    this.guardando = false;

    this.alertService.error(
      err.error?.message ||
      'Ocurrió un error al guardar la información'
    );

  }

}
