
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Reporte } from '../interfaces/reporte.interface';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private http = inject(HttpClient);

  private apiUrl = 'api/v1/reportes';

  // RF-25: Reporte diario de atenciones
  getReporteDiario(fecha: string): Observable<Reporte[]> {
    const params = new HttpParams().set('fecha', fecha);

    return this.http.get<Reporte[]>(
      `${this.apiUrl}/diario`,
      { params }
    );
  }

  // RF-25: Reporte semanal de atenciones
  getReporteSemanal(fecha: string): Observable<Reporte[]> {
    const params = new HttpParams().set('fecha', fecha);

    return this.http.get<Reporte[]>(
      `${this.apiUrl}/semanal`,
      { params }
    );
  }

  // RF-25: Reporte mensual de atenciones
  getReporteMensual(fecha: string): Observable<Reporte[]> {
    const params = new HttpParams().set('fecha', fecha);

    return this.http.get<Reporte[]>(
      `${this.apiUrl}/mensual`,
      { params }
    );
  }

}
