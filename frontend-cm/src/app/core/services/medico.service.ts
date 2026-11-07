
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Medico } from '../interfaces/medico.interfaces';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {

  private http = inject(HttpClient);

  // Ruta del backend
  private apiUrl = 'api/v1/medicos';

  // Listar médicos
  getMedicos(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.apiUrl);
  }

  // Buscar médico por ID
  getMedicoById(id: number): Observable<Medico> {
    return this.http.get<Medico>(`${this.apiUrl}/${id}`);
  }

  // Registrar médico
  createMedico(medico: Medico): Observable<Medico> {
    return this.http.post<Medico>(this.apiUrl, medico);
  }

  // Actualizar médico
  updateMedico(
    id: number,
    medico: Medico
  ): Observable<Medico> {
    return this.http.put<Medico>(
      `${this.apiUrl}/${id}`,
      medico
    );
  }

}
