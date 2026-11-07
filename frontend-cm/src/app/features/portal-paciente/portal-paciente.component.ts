import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Paciente {
  idPersona: number;
  dni: string;
  nombres: string;
  apellidos: string;
}

interface Medico {
  idEmpleado: number;
  especialidad: string;
  codigoCol: string;
}

interface Horario {
  idHorario: number;
  idMedico: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
}

interface Cita {
  idCita: number;
  idPersona: number;
  idMedico: number | null;
  fechaCita: string;
  horaCita: string;
  estado: string;
  medico?: string | null;
  motivoConsulta: string;
}

interface DiaDisponible {
  fecha: string;
  dia: string;
  numero: string;
  mes: string;
  horas: string[];
}
@Component({
  selector: 'app-portal-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portal-paciente.component.html',
  styleUrl: './portal-paciente.component.css'
})
export class PortalPaciente implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/v1'; // Usa el proxy de Angular.

  pestana: 'registrar' | 'mis-citas' = 'registrar';
  dni = '';
  paciente: Paciente | null = null;
  medicos: Medico[] = [];
  medicoSeleccionado: Medico | null = null;
  horariosPorMedico: Record<number, Horario[]> = {};
  horarios: Horario[] = [];
  citasMedico: Cita[] = [];
  misCitas: Cita[] = [];

  fechaSeleccionada = '';
  horaSeleccionada = '';
  motivoConsulta = '';
  diasDisponibles: DiaDisponible[] = [];
  inicioDias = 0;
  readonly diasPorPagina = 4;
  readonly horizonteDias = 28;

  cargando = false;
  cargandoMedicos = false;
  cargandoHorarios = false;
  guardando = false;
  mensaje = '';
  error = '';

  ngOnInit(): void {
    this.cargarMedicos();
  }
   cambiarPestana(opcion: 'registrar' | 'mis-citas'): void {
    this.pestana = opcion;
    this.error = '';
    this.mensaje = '';
    if (opcion === 'mis-citas' && this.paciente) {
      this.consultarMisCitas();
    }
  }

  buscarPaciente(): void {
    this.error = '';
    this.mensaje = '';
    this.paciente = null;
    this.misCitas = [];
    this.medicoSeleccionado = null;
    this.limpiarSeleccion();

    const dniBuscado = this.dni.trim();
    if (!/^\d{8}$/.test(dniBuscado)) {
      this.error = 'Ingresa un DNI válido de 8 dígitos.';
      return;
    }

    this.cargando = true;
    this.http.get<Paciente>(`${this.api}/personas/dni/${dniBuscado}`).subscribe({
      next: paciente => {
        this.paciente = paciente;
        this.cargando = false;
        if (this.pestana === 'mis-citas') this.consultarMisCitas();
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.error = err.status === 404
          ? 'No se encontró un paciente con ese DNI.'
          : 'No se pudo consultar el paciente. Revisa la conexión con el servidor.';
      }
    });
  }
    cargarMedicos(): void {
    this.cargandoMedicos = true;
    this.http.get<Medico[]>(`${this.api}/medicos`).subscribe({
      next: medicos => {
        this.medicos = medicos;
        this.cargandoMedicos = false;
        medicos.forEach(medico => {
          this.http.get<Horario[]>(
            `${this.api}/horarios-medicos/medico/${medico.idEmpleado}`
          ).pipe(catchError(() => of([] as Horario[]))).subscribe(horarios => {
            this.horariosPorMedico[medico.idEmpleado] = horarios;
          });
        });
      },
      error: () => {
        this.cargandoMedicos = false;
        this.error = 'No se pudieron cargar los médicos.';
      }
    });
  }

  obtenerTurnoMedico(idMedico: number): string {
    const horarios = this.horariosPorMedico[idMedico];
    if (!horarios) return 'Consultando horarios...';
    const activos = horarios.filter(h => h.estado?.toUpperCase() === 'ACTIVO');
    if (!activos.length) return 'Sin horario activo';
    const manana = activos.some(h => this.aMinutos(h.horaInicio) < 720);
    const tarde = activos.some(h => this.aMinutos(h.horaFin) > 720);
    if (manana && tarde) return 'Mañana y tarde';
    return manana ? 'Turno mañana' : 'Turno tarde';
  }

  seleccionarMedico(medico: Medico): void {
    this.medicoSeleccionado = medico;
    this.error = '';
    this.mensaje = '';
    this.limpiarSeleccion();
    this.cargarHorariosMedico(medico.idEmpleado);
  }
   cargarHorariosMedico(idMedico: number): void {
    this.cargandoHorarios = true;
    forkJoin({
      horarios: this.http.get<Horario[]>(`${this.api}/horarios-medicos/medico/${idMedico}`),
      citas: this.http.get<Cita[]>(`${this.api}/citas/medico/${idMedico}`)
    }).subscribe({
      next: ({ horarios, citas }) => {
        // Ignorar una respuesta tardía si el usuario ya cambió de médico.
        if (this.medicoSeleccionado?.idEmpleado !== idMedico) return;
        this.horarios = horarios;
        this.horariosPorMedico[idMedico] = horarios;
        this.citasMedico = citas;
        this.cargandoHorarios = false;
        this.generarDiasDisponibles();
      },
      error: () => {
        if (this.medicoSeleccionado?.idEmpleado !== idMedico) return;
        this.cargandoHorarios = false;
        this.error = 'No se pudieron consultar los horarios y las citas del médico.';
      }
    });
  }

  private limpiarSeleccion(): void {
    this.horarios = [];
    this.citasMedico = [];
    this.diasDisponibles = [];
    this.inicioDias = 0;
    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';
    this.motivoConsulta = '';
  }
generarDiasDisponibles(): void {
    const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const diasCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const dias: DiaDisponible[] = [];

    for (let i = 0; i < this.horizonteDias; i++) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
      const clave = this.formatearFecha(fecha);
      const nombreDia = diasSemana[fecha.getDay()];
      const horariosDelDia = this.horarios.filter(h =>
        h.estado?.toUpperCase() === 'ACTIVO' &&
        h.diaSemana?.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === nombreDia
      );

      const ocupadas = new Set(
        this.citasMedico
          .filter(c => c.fechaCita === clave &&
            !['ANULADO', 'CANCELADO'].includes((c.estado || '').toUpperCase()))
          .map(c => (c.horaCita || '').substring(0, 5))
      );

      const horas = new Set<string>();
      for (const horario of horariosDelDia) {
        let minuto = this.aMinutos(horario.horaInicio);
        const fin = this.aMinutos(horario.horaFin);
        while (minuto + 15 <= fin) {
          const hora = this.aHora(minuto);
          const instante = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(),
            Math.floor(minuto / 60), minuto % 60);
          if (!ocupadas.has(hora) && instante > hoy) horas.add(hora);
          minuto += 15;
        }
      }

      if (horas.size) {
        dias.push({
          fecha: clave,
          dia: diasCortos[fecha.getDay()],
          numero: String(fecha.getDate()).padStart(2, '0'),
          mes: meses[fecha.getMonth()],
          horas: Array.from(horas).sort()
        });
      }
    }

    this.diasDisponibles = dias;
    if (!dias.some(d => d.fecha === this.fechaSeleccionada)) {
      this.fechaSeleccionada = dias[0]?.fecha || '';
      this.horaSeleccionada = '';
      this.inicioDias = 0;
    }
    if (!this.horasDisponibles.includes(this.horaSeleccionada)) {
      this.horaSeleccionada = '';
    }
  }
get diasVisibles(): DiaDisponible[] {
    return this.diasDisponibles.slice(this.inicioDias, this.inicioDias + this.diasPorPagina);
  }

  get puedeRetroceder(): boolean {
    return this.inicioDias > 0;
  }

  get puedeAvanzar(): boolean {
    return this.inicioDias + this.diasPorPagina < this.diasDisponibles.length;
  }

  moverDias(direccion: -1 | 1): void {
    this.inicioDias = Math.max(0, Math.min(
      this.inicioDias + direccion * this.diasPorPagina,
      Math.max(0, this.diasDisponibles.length - this.diasPorPagina)
    ));
  }

  seleccionarFecha(fecha: string): void {
    this.fechaSeleccionada = fecha;
    this.horaSeleccionada = '';
  }

  get horasDisponibles(): string[] {
    return this.diasDisponibles.find(d => d.fecha === this.fechaSeleccionada)?.horas || [];
  }
private formatearFecha(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private aMinutos(hora: string): number {
    const [h, m] = (hora || '00:00').split(':').map(Number);
    return h * 60 + m;
  }

  private aHora(minutos: number): string {
    return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
  }

  confirmarCita(): void {
    if (this.guardando) return;
    if (!this.paciente || !this.medicoSeleccionado || !this.fechaSeleccionada ||
        !this.horaSeleccionada || !this.motivoConsulta.trim()) {
      this.error = 'Selecciona un horario y escribe el motivo de consulta.';
      return;
    }
    if (!this.horasDisponibles.includes(this.horaSeleccionada)) {
      this.error = 'El horario seleccionado ya no está disponible.';
      return;
    }

    this.error = '';
    this.mensaje = '';
    this.guardando = true;
    const idMedico = this.medicoSeleccionado.idEmpleado;
    const nuevaCita = {
      idPersona: this.paciente.idPersona,
      idMedico,
      fechaCita: this.fechaSeleccionada,
      horaCita: this.horaSeleccionada,
      motivoConsulta: this.motivoConsulta.trim(),
      notificacion: 'N'
    };
     this.http.post<Cita>(`${this.api}/citas`, nuevaCita).subscribe({
      next: () => {
        this.guardando = false;
        this.mensaje = '¡Tu cita médica se registró correctamente!';
        this.horaSeleccionada = '';
        this.motivoConsulta = '';
        if (this.medicoSeleccionado?.idEmpleado === idMedico) {
          this.cargarHorariosMedico(idMedico);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.error = typeof err.error?.message === 'string'
          ? err.error.message
          : 'No se pudo registrar la cita. Verifica los datos y la disponibilidad.';
        if (this.medicoSeleccionado?.idEmpleado === idMedico) {
          this.cargarHorariosMedico(idMedico);
        }
      }
    });
  }

  consultarMisCitas(): void {
    if (!this.paciente) return;
    this.cargando = true;
    this.http.get<Cita[]>(`${this.api}/citas/paciente/${this.paciente.idPersona}`).subscribe({
      next: citas => {
        this.misCitas = [...citas].sort((a, b) =>
          (b.fechaCita + b.horaCita).localeCompare(a.fechaCita + a.horaCita));
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudieron consultar tus citas.';
      }
    });
  }
}