
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Persona } from '../interfaces/persona.interface';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {

  private http = inject(HttpClient);

  // Ruta del backend
  private apiUrl = 'api/v1/personas';

  // Listar personas
  getPersonas(): Observable<Persona[]> {
    return this.http.get<Persona[]>(this.apiUrl);
  }

  // Buscar persona por ID
  getPersonaById(id: number): Observable<Persona> {
    return this.http.get<Persona>(`${this.apiUrl}/${id}`);
  }

  // Buscar por DNI
  getPersonaByDni(dni: string): Observable<Persona> {
    return this.http.get<Persona>(`${this.apiUrl}/dni/${dni}`);
  }

  // Buscar por código universitario
  getPersonaByCodigo(codigo: string): Observable<Persona> {
    return this.http.get<Persona>(
      `${this.apiUrl}/codigo/${codigo}`
    );
  }

  // Registrar persona
  createPersona(persona: Persona): Observable<Persona> {
    return this.http.post<Persona>(this.apiUrl, persona);
  }

  // Actualizar persona
  updatePersona(id: number, persona: Persona): Observable<Persona> {
    return this.http.put<Persona>(
      `${this.apiUrl}/${id}`,
      persona
    );
  }

  // Eliminar persona
  deletePersona(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
