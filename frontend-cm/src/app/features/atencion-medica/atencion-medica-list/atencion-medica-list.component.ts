
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Cita } from '../../../core/interfaces/cita.interface';
import { CitaService } from '../../../core/services/cita.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-atencion-medica-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './atencion-medica-list.component.html',
  styleUrl: './atencion-medica-list.component.css'
})
export class AtencionListComponent implements OnInit {

  private citaService = inject(CitaService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  citas: Cita[] = [];
  cargando = false;

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.cargando = true;

    this.citaService.getCitas().subscribe({
      next: (data) => {
        this.citas = data.filter(c => c.estado === 'TRIAJE');
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.alertService.error('No se pudieron cargar las citas');
        this.cargando = false;
      }
    });
  }

  atender(cita: Cita): void {
    if (!cita.idCita) return;
    this.router.navigate(['/atencion/registrar', cita.idCita]);
  }
}
