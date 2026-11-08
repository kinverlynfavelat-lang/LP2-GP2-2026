
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Receta } from '../interfaces/receta.interface';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {

  private http = inject(HttpClient);
  private apiUrl = '/api/v1/recetas';

  getRecetas(): Observable<Receta[]> {
    return this.http.get<Receta[]>(this.apiUrl);
  }
}
