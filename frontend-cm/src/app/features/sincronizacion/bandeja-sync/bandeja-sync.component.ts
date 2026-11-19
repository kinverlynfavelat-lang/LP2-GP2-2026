import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { OfflineDbService, SyncQueueItem } from '../../../core/offline/db.service';
import { NetworkService } from '../../../core/offline/network.service';
import { SyncService } from '../../../core/offline/sync.service';
import { CatalogCacheService } from '../../../core/offline/catalog-cache.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-bandeja-sync',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bandeja-sync.component.html',
  styleUrl: './bandeja-sync.component.css'
})
export class BandejaSyncComponent implements OnInit {
  readonly network = inject(NetworkService);
  readonly sync = inject(SyncService);
  readonly catalogCache = inject(CatalogCacheService);
  private db = inject(OfflineDbService);
  private alert = inject(AlertService);

  cola: SyncQueueItem[] = [];
  cargando = false;

  // Contadores de caché local
  totalPacientesCache = 0;
  totalMedicosCache = 0;
  totalMedicamentosCache = 0;
  totalDiagnosticosCache = 0;

  // Edición inline para reubicar cita en conflicto (409)
  editandoId: number | null = null;
  nuevaFecha = '';
  nuevaHora = '';

  ngOnInit(): void {
    this.refrescar();
  }

  get conflictos(): SyncQueueItem[] {
    return this.cola.filter(i => i.status === 'CONFLICTO');
  }

  get pendientes(): SyncQueueItem[] {
    return this.cola.filter(i => i.status === 'PENDIENTE');
  }

  get errores(): SyncQueueItem[] {
    return this.cola.filter(i => i.status === 'ERROR');
  }

  async refrescar(): Promise<void> {
    this.cargando = true;
    try {
      this.cola = await this.sync.obtenerColaCompleta();
      await this.sync.actualizarContadores();

      const [pac, med, farm, cie] = await Promise.all([
        this.db.personas.where('tipoPersona').equals('PACIENTE').count(),
        this.db.medicos.count(),
        this.db.medicamentos.count(),
        this.db.diagnosticos.count()
      ]);

      this.totalPacientesCache = pac;
      this.totalMedicosCache = med;
      this.totalMedicamentosCache = farm;
      this.totalDiagnosticosCache = cie;
    } finally {
      this.cargando = false;
    }
  }

  async sincronizarAhora(): Promise<void> {
    if (!this.network.isOnline()) {
      this.alert.error('No hay conexión a internet en este momento.');
      return;
    }

    const res = await this.sync.procesarCola();
    await this.refrescar();

    if (res.conflictos > 0) {
      this.alert.error(
        `Se sincronizaron ${res.sincronizados} registro(s), pero ${res.conflictos} cita(s) presentan conflicto de horario (409) y requieren reubicación.`
      );
    } else if (res.sincronizados > 0) {
      this.alert.success(`Se sincronizaron ${res.sincronizados} operación(es) correctamente.`);
    } else if (res.errores > 0) {
      this.alert.error(`Hubo ${res.errores} error(es) de validación al sincronizar.`);
    } else {
      this.alert.toast('No hay operaciones pendientes por sincronizar');
    }
  }

  async actualizarCatalogos(): Promise<void> {
    const ok = await this.catalogCache.sincronizarCatalogos();
    await this.refrescar();
    if (ok) {
      this.alert.toast('Catálogos offline actualizados en IndexedDB');
    } else {
      this.alert.error('No se pudieron actualizar los catálogos (verifica tu conexión).');
    }
  }

  abrirReubicacion(item: SyncQueueItem): void {
    this.editandoId = item.id ?? null;
    this.nuevaFecha = item.payload?.fechaCita || '';
    this.nuevaHora = item.payload?.horaCita || '';
  }

  cancelarReubicacion(): void {
    this.editandoId = null;
    this.nuevaFecha = '';
    this.nuevaHora = '';
  }

  async confirmarReubicacion(item: SyncQueueItem): Promise<void> {
    if (!item.id || !this.nuevaFecha || !this.nuevaHora) {
      this.alert.error('Ingresa la nueva fecha y hora para reubicar la cita.');
      return;
    }

    await this.sync.reubicarCita(item.id, this.nuevaFecha, this.nuevaHora);
    this.cancelarReubicacion();
    await this.refrescar();
    this.alert.toast('Cita reubicada y enviada a sincronización');
  }

  async reintentar(item: SyncQueueItem): Promise<void> {
    if (!item.id) return;
    await this.sync.reintentarItem(item.id);
    await this.refrescar();
  }

  async descartar(item: SyncQueueItem): Promise<void> {
    if (!item.id) return;
    const ok = await this.alert.confirm(
      '¿Descartar esta operación de la cola local? Los datos no sincronizados se eliminarán.'
    );
    if (!ok) return;

    await this.sync.descartarItem(item.id);
    await this.refrescar();
    this.alert.toast('Registro eliminado de la cola local');
  }
}
