
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Cita } from '../interfaces/cita.interface';
import { MedicoProductividad } from '../interfaces/medico-productividad.interface';

@Injectable({
  providedIn: 'root'
})
export class CitaService {

  private http = inject(HttpClient);

  // Ruta del backend mediante el proxy de Angular
  private apiUrl = '/api/v1/citas';

  // ==========================================
  // LISTAR TODAS LAS CITAS
  // ==========================================

  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl);
  }

  // ==========================================
  // MIS CITAS - MEDICO AUTENTICADO
  // ==========================================

  getMisCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(
      `${this.apiUrl}/mis-citas`
    );
  }

  // ==========================================
  // HISTORIAL DE PACIENTES
  // ==========================================

  getHistorialPacientes(): Observable<Cita[]> {
    return this.http.get<Cita[]>(
      `${this.apiUrl}/historial-pacientes`
    );
  }

  // ==========================================
  // ALERTAS DE TRIAJE
  // ==========================================

  getAlertasTriaje(
    temp?: number,
    presion?: number
  ): Observable<Cita[]> {

    let url = `${this.apiUrl}/alertas-triaje`;
    const params: string[] = [];

    if (temp !== undefined) {
      params.push(`temp=${temp}`);
    }

    if (presion !== undefined) {
      params.push(`presion=${presion}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<Cita[]>(url);
  }

  // ==========================================
  // PRODUCTIVIDAD MEDICA
  // ==========================================

  getProductividadMedicos(): Observable<MedicoProductividad[]> {
    return this.http.get<MedicoProductividad[]>(
      `${this.apiUrl}/productividad-medicos`
    );
  }

  // ==========================================
  // BUSCAR CITA POR ID
  // ==========================================

  getCitaById(id: number): Observable<Cita> {
    return this.http.get<Cita>(
      `${this.apiUrl}/${id}`
    );
  }

  // ==========================================
  // CITAS POR PACIENTE
  // ==========================================

  getCitasByPaciente(idPersona: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(
      `${this.apiUrl}/paciente/${idPersona}`
    );
  }

  // ==========================================
  // CITAS POR MEDICO
  // ==========================================

  getCitasByMedico(idMedico: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(
      `${this.apiUrl}/medico/${idMedico}`
    );
  }

  // ==========================================
  // REGISTRAR CITA
  // ==========================================

  createCita(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(
      this.apiUrl,
      cita
    );
  }

  // ==========================================
  // ACTUALIZAR CITA
  // ==========================================

  updateCita(id: number, cita: Cita): Observable<Cita> {
    return this.http.put<Cita>(
      `${this.apiUrl}/${id}`,
      cita
    );
  }

  // ==========================================
  // ANULAR CITA
  // ==========================================

  anularCita(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/anular`,
      {}
    );
  }

}
