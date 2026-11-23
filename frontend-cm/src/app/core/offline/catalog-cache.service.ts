
import { Injectable, inject, signal } from '@angular/core';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';

import { OfflineDbService } from './db.service';
import { NetworkService } from './network.service';

import { PersonaService } from '../services/persona.service';
import { EmpleadoService } from '../services/empleado.service';
import { MedicoService } from '../services/medico.service';
import { HorarioMedicoService } from '../services/horario-medico.service';
import { MedicamentoService } from '../services/medicamento.service';
import { CitaService } from '../services/cita.service';

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

  async sincronizarCatalogos(): Promise<boolean> {

    const token = localStorage.getItem('token_centro_medico');
    const rol = localStorage.getItem('cm_user_role');

    if (!token || !this.network.isOnline() || this.actualizando()) {
      return false;
    }

    const esAdmin = rol === 'ADMIN';
    const esMedico = rol === 'MEDICO';
    const esTriaje = rol === 'TRIAJE';

    const puedeVerMedicamentos =
      esAdmin || esMedico || rol === 'FARMACIA';

    // No sincronizar si el rol no es reconocido.
    if (!esAdmin && !esMedico && !esTriaje && rol !== 'FARMACIA') {
      return false;
    }

    this.actualizando.set(true);

    try {

      const data = await firstValueFrom(
        forkJoin({

          // Solo ADMIN puede consultar todas las personas.
          personas: esAdmin
            ? this.personaService.getPersonas().pipe(
                catchError(() => of([]))
              )
            : of([]),

          // Solo ADMIN puede consultar todos los empleados.
          empleados: esAdmin
            ? this.empleadoService.getEmpleados().pipe(
                catchError(() => of([]))
              )
            : of([]),

          // Catalogo de medicos.
          medicos: this.medicoService.getMedicos().pipe(
            catchError(() => of([]))
          ),

          // Medicamentos segun permisos del rol.
          medicamentos: puedeVerMedicamentos
            ? this.medicamentoService.getMedicamentos().pipe(
                catchError(() => of([]))
              )
            : of([]),

          // ADMIN y TRIAJE consultan las citas generales.
          // MEDICO consulta solamente sus propias citas.
          // FARMACIA no consulta citas.
          citas: esAdmin || esTriaje
            ? this.citaService.getCitas().pipe(
                catchError(() => of([]))
              )
            : esMedico
              ? this.citaService.getMisCitas().pipe(
                  catchError(() => of([]))
                )
              : of([])
        })
      );

      // Descargar horarios de los medicos registrados.
      let horariosTodos: any[] = [];

      const medicosConId = data.medicos.filter(
        m => m.idEmpleado != null
      );

      if (medicosConId.length > 0) {

        const horariosRequests = medicosConId.map(
          m => this.horarioService
            .getHorariosByMedico(m.idEmpleado!)
            .pipe(catchError(() => of([])))
        );

        const resultadosHorarios =
          await firstValueFrom(forkJoin(horariosRequests));

        horariosTodos = resultadosHorarios.flat();
      }

      // Mantener el almacenamiento offline existente.
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

          if (data.personas.length > 0) {
            await this.db.personas.bulkPut(data.personas);
          }

          if (data.empleados.length > 0) {
            await this.db.empleados.bulkPut(data.empleados);
          }

          if (data.medicos.length > 0) {
            await this.db.medicos.bulkPut(data.medicos);
          }

          if (horariosTodos.length > 0) {
            await this.db.horarios.bulkPut(horariosTodos);
          }

          if (data.medicamentos.length > 0) {
            await this.db.medicamentos.bulkPut(data.medicamentos);
          }

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

      console.warn(
        'No se pudieron precargar los catalogos offline:',
        err
      );

      return false;

    } finally {

      this.actualizando.set(false);
    }
  }
}
