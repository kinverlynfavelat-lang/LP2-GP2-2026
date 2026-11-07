import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Cita } from '../interfaces/cita.interface';

@Injectable({
  providedIn: 'root'
})
export class CitaService {

  private http = inject(HttpClient);

  // Ruta del backend
  private apiUrl = 'api/v1/citas';

  // Listar todas las citas
  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl);
  }

  // Buscar cita por ID
  getCitaById(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}/${id}`);
  }

  // Listar citas por paciente
  getCitasByPaciente(idPersona: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(
      `${this.apiUrl}/paciente/${idPersona}`
    );
  }

  // Listar citas por médico
  getCitasByMedico(idMedico: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(
      `${this.apiUrl}/medico/${idMedico}`
    );
  }

  // Registrar cita
  createCita(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(this.apiUrl, cita);
  }

  // Actualizar cita
  updateCita(id: number, cita: Cita): Observable<Cita> {
    return this.http.put<Cita>(
      `${this.apiUrl}/${id}`,
      cita
    );
  }

  // Anular cita
  anularCita(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/anular`,
      {}
    );
  }

}