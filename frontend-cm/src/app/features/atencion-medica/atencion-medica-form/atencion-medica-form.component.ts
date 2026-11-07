
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Cita } from '../../../core/interfaces/cita.interface';
import { CitaService } from '../../../core/services/cita.service';
import { AlertService } from '../../../core/services/alert.service';
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
        this.alertService.error('No se pudo cargar la cita');
        this.cargando = false;
        this.cancelar();
      }
    });
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

  guardar(): void {
    if (!this.cita || this.guardando) return;

    this.guardando = true;

    this.citaService.updateCita(
      this.idCita,
      this.prepararDatos('TRIAJE')
    ).subscribe({
      next: () => {
        this.alertService.success('Atención guardada correctamente');
        this.router.navigate(['/atencion']);
      },
      error: (err) => {
        console.error(err);
        this.alertService.error(
          err.error?.message || 'No se pudo guardar la atención'
        );
        this.guardando = false;
      }
    });
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

    this.citaService.updateCita(
      this.idCita,
      this.prepararDatos('ATENDIDO')
    ).subscribe({
      next: () => {
        this.alertService.success(
          'Atención médica finalizada correctamente'
        );
        this.router.navigate(['/atencion']);
      },
      error: (err) => {
        console.error(err);
        this.alertService.error(
          err.error?.message || 'No se pudo finalizar la atención'
        );
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/atencion']);
  }
}
