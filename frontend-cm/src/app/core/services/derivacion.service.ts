import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Derivacion,
  DerivacionRequest
} from '../interfaces/derivacion.interface';

@Injectable({
  providedIn: 'root'
})
export class DerivacionService {

  private http = inject(HttpClient);
  private apiUrl = '/api/v1/derivaciones';

  getDerivaciones(): Observable<Derivacion[]> {
    return this.http.get<Derivacion[]>(this.apiUrl);
  }

  getDerivacionById(id: number): Observable<Derivacion> {
    return this.http.get<Derivacion>(`${this.apiUrl}/${id}`);
  }

  getDerivacionesByCita(idCita: number): Observable<Derivacion[]> {
    return this.http.get<Derivacion[]>(`${this.apiUrl}/cita/${idCita}`);
  }

  createDerivacion(derivacion: DerivacionRequest): Observable<Derivacion> {
    return this.http.post<Derivacion>(this.apiUrl, derivacion);
  }

  updateDerivacion(id: number, derivacion: DerivacionRequest): Observable<Derivacion> {
    return this.http.put<Derivacion>(`${this.apiUrl}/${id}`, derivacion);
  }

  deleteDerivacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
