
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HorarioMedico } from '../interfaces/horario-medico.interface';

@Injectable({
  providedIn: 'root'
})
export class HorarioMedicoService {

  private http = inject(HttpClient);

  private apiUrl = 'api/v1/horarios-medicos';

  // Listar horarios por médico
  getHorariosByMedico(idMedico: number): Observable<HorarioMedico[]> {
    return this.http.get<HorarioMedico[]>(
      `${this.apiUrl}/medico/${idMedico}`
    );
  }

  // Buscar horario por ID
  getHorarioById(id: number): Observable<HorarioMedico> {
    return this.http.get<HorarioMedico>(
      `${this.apiUrl}/${id}`
    );
  }

  // Registrar horario
  createHorario(horario: HorarioMedico): Observable<HorarioMedico> {
    return this.http.post<HorarioMedico>(
      this.apiUrl,
      horario
    );
  }

  // Actualizar horario
  updateHorario(
    id: number,
    horario: HorarioMedico
  ): Observable<HorarioMedico> {
    return this.http.put<HorarioMedico>(
      `${this.apiUrl}/${id}`,
      horario
    );
  }

}
