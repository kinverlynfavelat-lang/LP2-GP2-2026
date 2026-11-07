
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Empleado } from '../interfaces/empleado.interface';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {

  private http = inject(HttpClient);

  private apiUrl = 'api/v1/empleados';

  getEmpleados(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.apiUrl);
  }

  // Buscar empleado por ID
  getEmpleadoById(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.apiUrl}/${id}`);
  }

  // Registrar empleado
  createEmpleado(empleado: Empleado): Observable<Empleado> {
    return this.http.post<Empleado>(this.apiUrl, empleado);
  }

  // Actualizar empleado
  updateEmpleado(
    id: number,
    empleado: Empleado
  ): Observable<Empleado> {
    return this.http.put<Empleado>(
      `${this.apiUrl}/${id}`,
      empleado
    );
  }

}
