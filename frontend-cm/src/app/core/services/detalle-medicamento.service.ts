
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  DetalleMedicamentoDTO,
  DetalleMedicamentoResponse
} from '../interfaces/detalle-medicamento.interface';

@Injectable({
  providedIn: 'root'
})
export class DetalleMedicamentoService {

  private http = inject(HttpClient);
  private apiUrl = '/api/v1/detalle-medicamentos';

  getDetalleMedicamentos(): Observable<DetalleMedicamentoResponse[]> {
    return this.http.get<DetalleMedicamentoResponse[]>(this.apiUrl);
  }

  registrarEntrega(
    dto: DetalleMedicamentoDTO
  ): Observable<DetalleMedicamentoResponse> {
    return this.http.post<DetalleMedicamentoResponse>(
      this.apiUrl,
      dto
    );
  }
}
