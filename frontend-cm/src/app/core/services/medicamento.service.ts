
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Medicamento } from '../interfaces/medicamento.interface';

@Injectable({
  providedIn: 'root'
})
export class MedicamentoService {

  private http = inject(HttpClient);
  private apiUrl = 'api/v1/medicamentos';

  getMedicamentos(): Observable<Medicamento[]> {
    return this.http.get<Medicamento[]>(this.apiUrl);
  }

  getMedicamentoById(id: number): Observable<Medicamento> {
    return this.http.get<Medicamento>(`${this.apiUrl}/${id}`);
  }

  createMedicamento(
    medicamento: Medicamento
  ): Observable<Medicamento> {
    return this.http.post<Medicamento>(
      this.apiUrl,
      medicamento
    );
  }

  updateMedicamento(
    id: number,
    medicamento: Medicamento
  ): Observable<Medicamento> {
    return this.http.put<Medicamento>(
      `${this.apiUrl}/${id}`,
      medicamento
    );
  }

  deleteMedicamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  ingresarStock(
    id: number,
    cantidad: number
  ): Observable<Medicamento> {
    const params = new HttpParams()
      .set('cantidad', cantidad.toString());

    return this.http.patch<Medicamento>(
      `${this.apiUrl}/${id}/ingresar-stock`,
      {},
      { params }
    );
  }

  descontarStock(
    id: number,
    cantidad: number
  ): Observable<Medicamento> {
    const params = new HttpParams()
      .set('cantidad', cantidad.toString());

    return this.http.patch<Medicamento>(
      `${this.apiUrl}/${id}/descontar-stock`,
      {},
      { params }
    );
  }
}
