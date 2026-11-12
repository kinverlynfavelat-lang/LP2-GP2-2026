
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Pago } from '../interfaces/pago.interface';
import { ResumenPago } from '../interfaces/resumen-pago.interface';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  private http = inject(HttpClient);

  private apiUrl = 'api/v1/pagos';

  // Listar todos los pagos
  getPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.apiUrl);
  }

  //Resumen de ingresos agrupados por medio de pago
  getResumenMedioPago(): Observable<ResumenPago[]> {
    return this.http.get<ResumenPago[]>(`${this.apiUrl}/resumen-medio-pago`);
  }

  // Buscar pago por ID de cita
  getPagoById(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/${id}`);
  }

  // Registrar pago de una cita
  registrarPago(pago: Pago): Observable<string> {
    return this.http.post(
      this.apiUrl,
      pago,
      { responseType: 'text' }
    );
  }

}
