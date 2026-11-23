
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import {
  Paciente,
  FondoEstudiantil,
  Medico,
  Horario,
  Cita
} from '../interfaces/portal-paciente.interface';

@Injectable({ providedIn: 'root' })
export class PortalPacienteService {

  private http = inject(HttpClient);

  private apiUrl = '/api/v1';

  // ==========================================
  // BUSCAR PACIENTE POR DNI
  // ==========================================

  buscarPaciente(dni: string) {
    return this.http.get<Paciente>(
      `${this.apiUrl}/personas/dni/${encodeURIComponent(dni)}`
    );
  }

  // ==========================================
  // BUSCAR PACIENTE POR CODIGO UNIVERSITARIO
  // ==========================================

  buscarPacientePorCodigo(codigoUniversitario: string) {
    return this.http.get<Paciente>(
      `${this.apiUrl}/personas/portal/codigo/${encodeURIComponent(codigoUniversitario)}`
    );
  }

  // ==========================================
  // LISTAR MEDICOS
  // ==========================================

  listarMedicos() {
    return this.http.get<Medico[]>(
      `${this.apiUrl}/medicos`
    );
  }

  // ==========================================
  // LISTAR HORARIOS DEL MEDICO
  // ==========================================

  listarHorariosMedico(idMedico: number) {
    return this.http.get<Horario[]>(
      `${this.apiUrl}/horarios-medicos/medico/${idMedico}`
    );
  }

  // ==========================================
  // CONSULTAR HORARIOS OCUPADOS
  // ==========================================

  listarCitasMedico(idMedico: number) {
    return this.http.get<Cita[]>(
      `${this.apiUrl}/citas/ocupadas/medico/${idMedico}`
    );
  }

  // ==========================================
  // REGISTRAR CITA MEDICA
  // ==========================================

  registrarCita(datos: {
    idPersona: number;
    idMedico: number;
    fechaCita: string;
    horaCita: string;
    motivoConsulta: string;
    notificacion: string;
  }) {
    return this.http.post<Cita>(
      `${this.apiUrl}/citas`,
      datos
    );
  }

  // ==========================================
  // CONSULTAR CITAS DEL PACIENTE
  // ==========================================

  listarCitasPaciente(idPersona: number) {
    return this.http.get<Cita[]>(
      `${this.apiUrl}/citas/paciente/${idPersona}`
    );
  }

  // ==========================================
  // ANULAR CITA
  // ==========================================

  anularCita(idCita: number) {
    return this.http.patch<void>(
      `${this.apiUrl}/citas/${idCita}/anular`,
      {}
    );
  }

  // ==========================================
  // REPROGRAMAR CITA
  // ==========================================

  reprogramarCita(
    idCita: number,
    fechaCita: string,
    horaCita: string
  ) {
    return this.http.patch<Cita>(
      `${this.apiUrl}/citas/${idCita}/reprogramar`,
      {
        fechaCita,
        horaCita
      }
    );
  }

  // ==========================================
  // CONSULTAR FONDO ESTUDIANTIL
  // ==========================================

  consultarFondo(codigoUniversitario: string) {
    return this.http.get<FondoEstudiantil>(
      `${this.apiUrl}/personas/fondo/${encodeURIComponent(codigoUniversitario)}`
    );
  }

}
