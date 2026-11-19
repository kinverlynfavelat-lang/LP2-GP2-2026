import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Persona } from '../interfaces/persona.interface';
import { Medicamento } from '../interfaces/medicamento.interface';
import { Cita } from '../interfaces/cita.interface';
import { Medico } from '../interfaces/medico.interfaces';
import { Empleado } from '../interfaces/empleado.interface';
import { HorarioMedico } from '../interfaces/horario-medico.interface';

export type SyncStatus = 'PENDIENTE' | 'SINCRONIZADO' | 'CONFLICTO' | 'ERROR';

export interface DiagnosticoCie10 {
  codigo: string;
  descripcion: string;
}

export interface CitaOffline extends Cita {
  localUuid: string;
  syncStatus: SyncStatus;
  errorMessage?: string;
}

export interface SyncQueueItem {
  id?: number; // Autoincremental => orden FIFO estricto
  entityType: 'PACIENTE' | 'CITA' | 'ATENCION' | 'RECETA';
  method: 'POST' | 'PUT';
  endpoint: string;
  payload: any;
  localUuid: string;
  dependsOnUuid?: string;
  resumen: string; // Texto legible para la bandeja (ej. nombre paciente + fecha/hora)
  status: SyncStatus;
  errorMessage?: string;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class OfflineDbService extends Dexie {
  personas!: Table<Persona, number>;
  empleados!: Table<Empleado, number>;
  medicos!: Table<Medico, number>;
  horarios!: Table<HorarioMedico, number>;
  medicamentos!: Table<Medicamento, number>;
  diagnosticos!: Table<DiagnosticoCie10, string>;
  citasLocales!: Table<CitaOffline, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('CentroMedicoOfflineDB');

    this.version(1).stores({
      personas: 'idPersona, dni, tipoPersona, codigoUniversitario',
      empleados: 'idPersona',
      medicos: 'idEmpleado, especialidad',
      horarios: 'idHorario, idMedico, diaSemana',
      medicamentos: 'idMedicamento, nombre',
      diagnosticos: 'codigo, descripcion',
      citasLocales: 'localUuid, idCita, syncStatus, [idMedico+fechaCita+horaCita]',
      syncQueue: '++id, status, entityType, localUuid, createdAt'
    });
  }
}
