import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { OfflineDbService, SyncQueueItem } from './db.service';
import { NetworkService } from './network.service';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private http = inject(HttpClient);
  private db = inject(OfflineDbService);
  private network = inject(NetworkService);

  readonly sincronizando = signal(false);
  readonly pendientesCount = signal(0);
  readonly conflictosCount = signal(0);
  readonly erroresCount = signal(0);

  // Mapa temporal: localUuid -> idCita definitivo asignado por Spring Boot
  private uuidToServerId = new Map<string, number>();

  constructor() {
    this.actualizarContadores();

    this.network.onlineChanges$.subscribe(online => {
      if (online) {
        this.procesarCola();
      }
    });
  }

  async actualizarContadores(): Promise<void> {
    const [pendientes, conflictos, errores] = await Promise.all([
      this.db.syncQueue.where('status').equals('PENDIENTE').count(),
      this.db.syncQueue.where('status').equals('CONFLICTO').count(),
      this.db.syncQueue.where('status').equals('ERROR').count()
    ]);

    this.pendientesCount.set(pendientes);
    this.conflictosCount.set(conflictos);
    this.erroresCount.set(errores);
  }

  async procesarCola(): Promise<{ sincronizados: number; conflictos: number; errores: number }> {
    if (this.sincronizando() || !this.network.isOnline()) {
      return { sincronizados: 0, conflictos: 0, errores: 0 };
    }

    this.sincronizando.set(true);
    let sincronizados = 0;
    let conflictos = 0;
    let errores = 0;

    try {
      const items = await this.db.syncQueue
        .where('status')
        .equals('PENDIENTE')
        .sortBy('id'); // Orden FIFO estricto

      for (const item of items) {
        const payload = { ...item.payload };

        // Resolver dependencia (ej. receta creada para una cita que nació offline)
        if (item.dependsOnUuid && this.uuidToServerId.has(item.dependsOnUuid)) {
          payload.idCita = this.uuidToServerId.get(item.dependsOnUuid);
        }

        let endpoint = item.endpoint;
        if (!endpoint.startsWith('/')) {
          endpoint = '/' + endpoint;
        }
        if (item.dependsOnUuid && this.uuidToServerId.has(item.dependsOnUuid)) {
          endpoint = endpoint.replace(item.dependsOnUuid, String(this.uuidToServerId.get(item.dependsOnUuid)));
        }

        try {
          const req$ = item.method === 'POST'
            ? this.http.post<any>(endpoint, payload)
            : this.http.put<any>(endpoint, payload);

          const res = await firstValueFrom(req$);

          if (item.entityType === 'CITA' && res?.idCita) {
            this.uuidToServerId.set(item.localUuid, res.idCita);
            await this.db.citasLocales.update(item.localUuid, {
              idCita: res.idCita,
              estado: res.estado ?? payload.estado,
              syncStatus: 'SINCRONIZADO',
              errorMessage: undefined
            });
          }

          await this.db.syncQueue.delete(item.id!);
          sincronizados++;
        } catch (err) {
          const httpErr = err as HttpErrorResponse;

          // Sin conexión real: detener procesamiento sin marcar como error definitivo
          if (httpErr.status === 0) {
            break;
          }

          const msg =
            httpErr.error?.message ||
            httpErr.error?.detail ||
            (typeof httpErr.error === 'string' ? httpErr.error : null) ||
            'Error al sincronizar el registro con el servidor.';

          if (httpErr.status === 409) {
            await this.db.syncQueue.update(item.id!, {
              status: 'CONFLICTO',
              errorMessage: msg
            });
            await this.db.citasLocales.update(item.localUuid, {
              syncStatus: 'CONFLICTO',
              errorMessage: msg
            });
            conflictos++;
          } else {
            await this.db.syncQueue.update(item.id!, {
              status: 'ERROR',
              errorMessage: msg
            });
            await this.db.citasLocales.update(item.localUuid, {
              syncStatus: 'ERROR',
              errorMessage: msg
            });
            errores++;
          }
        }
      }
    } finally {
      this.sincronizando.set(false);
      await this.actualizarContadores();
    }

    return { sincronizados, conflictos, errores };
  }

  async obtenerColaCompleta(): Promise<SyncQueueItem[]> {
    return this.db.syncQueue.orderBy('id').toArray();
  }

  /** Reubica una cita con conflicto (409) cambiando solo fecha y hora, sin perder datos del paciente */
  async reubicarCita(itemId: number, nuevaFecha: string, nuevaHora: string): Promise<void> {
    const item = await this.db.syncQueue.get(itemId);
    if (!item) return;

    const nuevoPayload = {
      ...item.payload,
      fechaCita: nuevaFecha,
      horaCita: nuevaHora
    };

    await this.db.transaction('rw', [this.db.syncQueue, this.db.citasLocales], async () => {
      await this.db.syncQueue.update(itemId, {
        payload: nuevoPayload,
        status: 'PENDIENTE',
        errorMessage: undefined
      });
      await this.db.citasLocales.update(item.localUuid, {
        fechaCita: nuevaFecha,
        horaCita: nuevaHora,
        syncStatus: 'PENDIENTE',
        errorMessage: undefined
      });
    });

    await this.actualizarContadores();
    if (this.network.isOnline()) {
      await this.procesarCola();
    }
  }

  async reintentarItem(itemId: number): Promise<void> {
    await this.db.syncQueue.update(itemId, {
      status: 'PENDIENTE',
      errorMessage: undefined
    });
    await this.actualizarContadores();
    if (this.network.isOnline()) {
      await this.procesarCola();
    }
  }

  async descartarItem(itemId: number): Promise<void> {
    const item = await this.db.syncQueue.get(itemId);
    if (item) {
      await this.db.citasLocales.delete(item.localUuid);
      await this.db.syncQueue.delete(itemId);
    }
    await this.actualizarContadores();
  }
}