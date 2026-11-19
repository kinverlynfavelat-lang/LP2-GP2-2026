import { Injectable, inject, signal } from '@angular/core';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { DiagnosticoCie10, OfflineDbService } from './db.service';
import { NetworkService } from './network.service';
import { PersonaService } from '../services/persona.service';
import { EmpleadoService } from '../services/empleado.service';
import { MedicoService } from '../services/medico.service';
import { HorarioMedicoService } from '../services/horario-medico.service';
import { MedicamentoService } from '../services/medicamento.service';
import { CitaService } from '../services/cita.service';

const CATALOGO_CIE10_BASE: DiagnosticoCie10[] = [
  { codigo: 'J00', descripcion: 'Rinofaringitis aguda (resfriado común)' },
  { codigo: 'J02.9', descripcion: 'Faringitis aguda, no especificada' },
  { codigo: 'J03.9', descripcion: 'Amigdalitis aguda, no especificada' },
  { codigo: 'A09', descripcion: 'Diarrea y gastroenteritis de presunto origen infeccioso' },
  { codigo: 'K29.7', descripcion: 'Gastritis, no especificada' },
  { codigo: 'R51', descripcion: 'Cefalea' },
  { codigo: 'R50.9', descripcion: 'Fiebre, no especificada' },
  { codigo: 'I10', descripcion: 'Hipertensión esencial (primaria)' },
  { codigo: 'E11.9', descripcion: 'Diabetes mellitus tipo 2 sin complicaciones' },
  { codigo: 'N39.0', descripcion: 'Infección de vías urinarias, sitio no especificado' },
  { codigo: 'M54.5', descripcion: 'Lumbago no especificado' },
  { codigo: 'S93.4', descripcion: 'Esguince y torcedura del tobillo' },
  { codigo: 'L23.9', descripcion: 'Dermatitis alérgica de contacto' },
  { codigo: 'F41.9', descripcion: 'Trastorno de ansiedad, no especificado' },
  { codigo: 'Z00.0', descripcion: 'Examen médico general' }
];

@Injectable({ providedIn: 'root' })
export class CatalogCacheService {
  private db = inject(OfflineDbService);
  private network = inject(NetworkService);
  private personaService = inject(PersonaService);
  private empleadoService = inject(EmpleadoService);
  private medicoService = inject(MedicoService);
  private horarioService = inject(HorarioMedicoService);
  private medicamentoService = inject(MedicamentoService);
  private citaService = inject(CitaService);

  readonly actualizando = signal(false);
  readonly ultimaActualizacion = signal<Date | null>(null);

  async inicializarCie10(): Promise<void> {
    const count = await this.db.diagnosticos.count();
    if (count === 0) {
      await this.db.diagnosticos.bulkPut(CATALOGO_CIE10_BASE);
    }
  }

  async sincronizarCatalogos(): Promise<boolean> {
    await this.inicializarCie10();

    if (!this.network.isOnline() || this.actualizando()) {
      return false;
    }

    this.actualizando.set(true);
    try {
      const data = await firstValueFrom(
        forkJoin({
          personas: this.personaService.getPersonas().pipe(catchError(() => of([]))),
          empleados: this.empleadoService.getEmpleados().pipe(catchError(() => of([]))),
          medicos: this.medicoService.getMedicos().pipe(catchError(() => of([]))),
          medicamentos: this.medicamentoService.getMedicamentos().pipe(catchError(() => of([]))),
          citas: this.citaService.getCitas().pipe(catchError(() => of([])))
        })
      );

      // Descargar horarios por cada médico registrado
      let horariosTodos: any[] = [];
      const medicosConId = data.medicos.filter(m => m.idEmpleado != null);
      if (medicosConId.length > 0) {
        const horariosRequests = medicosConId.map(m =>
          this.horarioService.getHorariosByMedico(m.idEmpleado!).pipe(catchError(() => of([])))
        );
        const resultadosHorarios = await firstValueFrom(forkJoin(horariosRequests));
        horariosTodos = resultadosHorarios.flat();
      }

      await this.db.transaction(
        'rw',
        [
          this.db.personas,
          this.db.empleados,
          this.db.medicos,
          this.db.horarios,
          this.db.medicamentos,
          this.db.citasLocales
        ],
        async () => {
          if (data.personas.length > 0) await this.db.personas.bulkPut(data.personas);
          if (data.empleados.length > 0) await this.db.empleados.bulkPut(data.empleados);
          if (data.medicos.length > 0) await this.db.medicos.bulkPut(data.medicos);
          if (horariosTodos.length > 0) await this.db.horarios.bulkPut(horariosTodos);
          if (data.medicamentos.length > 0) await this.db.medicamentos.bulkPut(data.medicamentos);

          if (data.citas.length > 0) {
            const citasSync = data.citas.map(c => ({
              ...c,
              localUuid: `server-${c.idCita}`,
              syncStatus: 'SINCRONIZADO' as const
            }));
            await this.db.citasLocales.bulkPut(citasSync);
          }
        }
      );

      this.ultimaActualizacion.set(new Date());
      return true;
    } catch (err) {
      console.warn('No se pudieron precargar los catálogos offline:', err);
      return false;
    } finally {
      this.actualizando.set(false);
    }
  }
}
