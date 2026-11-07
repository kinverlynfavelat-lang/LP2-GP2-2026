import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CitaService } from '../../../core/services/cita.service';
import { Cita } from '../../../core/interfaces/cita.interface';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-cita-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cita-list.component.html',
  styleUrl: './cita-list.component.css'
})
export class CitaListComponent implements OnInit {

  private citaService = inject(CitaService);
  private alertService = inject(AlertService);

  citas: Cita[] = [];

  ngOnInit(): void {
    this.listCitas();
  }

  // Listar citas
  listCitas() {
    this.citaService.getCitas().subscribe({
      next: (data) => {
        this.citas = data;
      },
      error: () => {
        this.alertService.error('No se pudieron cargar las citas');
      }
    });
  }

  // Anular cita
  async anular(id: number) {

    const confirmado = await this.alertService.confirm(
      '¿Está seguro de anular esta cita?'
    );

    if (confirmado) {
      this.citaService.anularCita(id).subscribe({
        next: () => {
          this.alertService.toast('Cita anulada correctamente');
          this.listCitas();
        },
        error: (err) => {
          const mensaje = err.error?.message ||
            'No se pudo anular la cita';

          this.alertService.error(mensaje);
        }
      });
    }
  }

}