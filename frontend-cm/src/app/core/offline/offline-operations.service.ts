import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Cita } from '../interfaces/cita.interface';
import { CitaService } from '../services/cita.service';
import { CitaOffline, OfflineDbService } from './db.service';
import { NetworkService } from './network.service';
import { SyncService } from './sync.service';

@Injectable({ providedIn: 'root' })
export class OfflineOperationsService {
  private http = inject(HttpClient);
  private citaService = inject(CitaService);
  private db = inject(OfflineDbService);
  private network = inject(NetworkService);
  private syncService = inject(SyncService);

  private generarUuid(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  // =========================================================================
  // RECEPCIÓN: Crear cita (online o offline con validación local de choque)
  // =========================================================================
  async guardarCita(
    cita: Cita,
    nombrePaciente?: string
  ): Promise<{ offline: boolean; idCita?: number; localUuid?: string }> {
    if (this.network.isOnline()) {
      try {
        const res = await firstValueFrom(this.citaService.createCita(cita));
        if (res?.idCita) {
          await this.db.citasLocales.put({
            ...res,
            localUuid: `server-${res.idCita}`,
            syncStatus: 'SINCRONIZADO'
          });
        }
        return { offline: false, idCita: res?.idCita };
      } catch (err) {
        const httpErr = err as HttpErrorResponse;
        // Si no es caída real de red (ej. 400 o 409 del backend), propagamos el error
        if (httpErr.status !== 0) {
          throw err;
        }
      }
    }

    // Modo Offline: validar choque de horario en IndexedDB local
    if (cita.idMedico && cita.fechaCita && cita.horaCita) {
      const choques = await this.db.citasLocales
        .where('[idMedico+fechaCita+horaCita]')
        .equals([cita.idMedico, cita.fechaCita, cita.horaCita])
        .filter(c => c.estado !== 'ANULADO')
        .count();

      if (choques > 0) {
        throw new Error(
          'Choque de horario local: ese médico ya tiene una cita registrada en esa fecha y hora.'
        );
      }
    }

    const localUuid = this.generarUuid();
    const citaLocal: CitaOffline = {
      ...cita,
      localUuid,
      paciente: nombrePaciente || cita.paciente,
      estado: 'PENDIENTE_SINCRONIZACION',
      syncStatus: 'PENDIENTE'
    };

    const resumen = `${nombrePaciente || 'Paciente #' + cita.idPersona} — ${cita.fechaCita} ${cita.horaCita}`;

    await this.db.transaction('rw', [this.db.citasLocales, this.db.syncQueue], async () => {
      await this.db.citasLocales.put(citaLocal);
      await this.db.syncQueue.add({
        entityType: 'CITA',
        method: 'POST',
        endpoint: 'api/v1/citas',
        payload: cita,
        localUuid,
        resumen,
        status: 'PENDIENTE',
        createdAt: Date.now()
      });
    });

    await this.syncService.actualizarContadores();
    return { offline: true, localUuid };
  }

  // =========================================================================
  // CONSULTORIO: Guardar atención médica (online o encolada en FIFO)
  // =========================================================================
  async guardarAtencion(
    idCita: number,
    datosCita: Cita
  ): Promise<{ offline: boolean }> {
    if (this.network.isOnline()) {
      try {
        await firstValueFrom(this.citaService.updateCita(idCita, datosCita));
        await this.db.citasLocales.put({
          ...datosCita,
          idCita,
          localUuid: `server-${idCita}`,
          syncStatus: 'SINCRONIZADO'
        });
        return { offline: false };
      } catch (err) {
        const httpErr = err as HttpErrorResponse;
        if (httpErr.status !== 0) {
          throw err;
        }
      }
    }

    const localUuid = `server-${idCita}`;
    const resumen = `Atención Cita #${idCita} (${datosCita.paciente || 'Paciente'}) — ${datosCita.estado}`;

    await this.db.transaction('rw', [this.db.citasLocales, this.db.syncQueue], async () => {
      await this.db.citasLocales.put({
        ...datosCita,
        idCita,
        localUuid,
        syncStatus: 'PENDIENTE'
      });
      await this.db.syncQueue.add({
        entityType: 'ATENCION',
        method: 'PUT',
        endpoint: `api/v1/citas/${idCita}`,
        payload: datosCita,
        localUuid,
        resumen,
        status: 'PENDIENTE',
        createdAt: Date.now()
      });
    });

    await this.syncService.actualizarContadores();
    return { offline: true };
  }

  // =========================================================================
  // CONSULTORIO: Guardar receta médica (online o encolada en FIFO)
  // =========================================================================
  async guardarReceta(
    payload: any,
    resumenReceta: string,
    idRecetaEditar?: number | null
  ): Promise<{ offline: boolean }> {
    const endpoint = idRecetaEditar ? `/api/v1/recetas/${idRecetaEditar}` : '/api/v1/recetas';
    const method: 'POST' | 'PUT' = idRecetaEditar ? 'PUT' : 'POST';

    if (this.network.isOnline()) {
      try {
        const req$ = method === 'POST'
          ? this.http.post(endpoint, payload)
          : this.http.put(endpoint, payload);
        await firstValueFrom(req$);
        return { offline: false };
      } catch (err) {
        const httpErr = err as HttpErrorResponse;
        if (httpErr.status !== 0) {
          throw err;
        }
      }
    }

    const localUuid = this.generarUuid();
    await this.db.syncQueue.add({
      entityType: 'RECETA',
      method,
      endpoint,
      payload,
      localUuid,
      resumen: resumenReceta,
      status: 'PENDIENTE',
      createdAt: Date.now()
    });

    await this.syncService.actualizarContadores();
    return { offline: true };
  }
}
