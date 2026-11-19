
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Cita } from '../../../core/interfaces/cita.interface';
import { CitaService } from '../../../core/services/cita.service';
import { AlertService } from '../../../core/services/alert.service';
import { OfflineDbService } from '../../../core/offline/db.service';
import { NetworkService } from '../../../core/offline/network.service';
import { OfflineOperationsService } from '../../../core/offline/offline-operations.service';
@Component({
  selector: 'app-atencion-medica-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './atencion-medica-form.component.html',
  styleUrl: './atencion-medica-form.component.css'
})
export class AtencionFormComponent implements OnInit {

  private citaService = inject(CitaService);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private offlineDb = inject(OfflineDbService);
  private network = inject(NetworkService);
  private offlineOps = inject(OfflineOperationsService);

  cita: Cita | null = null;
  idCita = 0;

  cargando = false;
  guardando = false;

  diagnostico = '';
  tratamiento = '';
  indicaciones = '';
  observaciones = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.alertService.error('Identificador de cita inválido');
      this.cancelar();
      return;
    }

    this.idCita = id;
    this.cargarCita();
  }

  cargarCita(): void {
    this.cargando = true;

    
    if (!this.network.isOnline()) {
      this.cargarCitaDesdeCache();
      return;
    }

    this.citaService.getCitaById(this.idCita).subscribe({
      next: (data) => {
        if (data.estado !== 'TRIAJE') {
          this.alertService.error(
            'Esta cita no está pendiente de atención'
          );
          this.cancelar();
          return;
        }

        this.cita = data;
        this.diagnostico = data.diagnostico || '';
        this.tratamiento = data.tratamiento || '';
        this.indicaciones = data.indicaciones || '';
        this.observaciones = data.observaciones || '';
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        console.warn('Error de red al cargar cita, intentando IndexedDB:', err);
        this.cargarCitaDesdeCache();
      }
    });
  }
  private async cargarCitaDesdeCache(): Promise<void> {
    const local = await this.offlineDb.citasLocales.where('idCita').equals(this.idCita).first();
    if (!local) {
      this.alertService.error('No se pudo cargar la cita (sin conexión ni caché local)');
      this.cargando = false;
      this.cancelar();
      return;
    }

    this.cita = local;
    this.diagnostico = local.diagnostico || '';
    this.tratamiento = local.tratamiento || '';
    this.indicaciones = local.indicaciones || '';
    this.observaciones = local.observaciones || '';
    this.cargando = false;
  }

  private prepararDatos(estado: string): Cita {
    return {
      ...this.cita!,
      diagnostico: this.diagnostico.trim() || null,
      tratamiento: this.tratamiento.trim() || null,
      indicaciones: this.indicaciones.trim() || null,
      observaciones: this.observaciones.trim() || null,
      estado
    };
  }

  async guardar(): Promise<void> {
    if (!this.cita || this.guardando) return;

    this.guardando = true;

    try {
      const res = await this.offlineOps.guardarAtencion(
        this.idCita,
        this.prepararDatos('TRIAJE')
      );

      if (res.offline) {
        this.alertService.success(
          'Sin conexión: atención guardada en cola local (FIFO) para sincronizar al volver el internet.'
        );
      } else {
        this.alertService.success('Atención guardada correctamente');
      }
      this.router.navigate(['/atencion']);
    } catch (err: any) {
      console.error(err);
      this.alertService.error(
        err?.error?.message || 'No se pudo guardar la atención'
      );
      this.guardando = false;
    }
  }

  async finalizar(): Promise<void> {
    if (!this.cita || this.guardando) return;

    if (!this.diagnostico.trim() || !this.tratamiento.trim()) {
      this.alertService.error(
        'Ingresa el diagnóstico y tratamiento para finalizar'
      );
      return;
    }

    const confirmado = await this.alertService.confirm(
      '¿Deseas finalizar la atención médica? La cita pasará a ATENDIDO.'
    );

    if (!confirmado || this.guardando) return;

    this.guardando = true;

    try {
      const res = await this.offlineOps.guardarAtencion(
        this.idCita,
        this.prepararDatos('ATENDIDO')
      );

      if (res.offline) {
        this.alertService.success(
          'Sin conexión: atención finalizada en cola local (FIFO) y se enviará al volver el internet.'
        );
      } else {
        this.alertService.success('Atención médica finalizada correctamente');
      }
      this.router.navigate(['/atencion']);
    } catch (err: any) {
      console.error(err);
      this.alertService.error(
        err?.error?.message || 'No se pudo finalizar la atención'
      );
      this.guardando = false;
    }
  }

  cancelar(): void {
    this.router.navigate(['/atencion']);
  }
}
