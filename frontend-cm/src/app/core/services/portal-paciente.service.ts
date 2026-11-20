
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import {Paciente,FondoEstudiantil,Medico,Horario,Cita} from '../interfaces/portal-paciente.interface';

@Injectable({providedIn: 'root'})
export class PortalPacienteService {

  private http = inject(HttpClient);

  private apiUrl = '/api/v1';

  // Buscar paciente por DNI
  buscarPaciente(dni: string) {
    return this.http.get<Paciente>(
      `${this.apiUrl}/personas/dni/${encodeURIComponent(dni)}`
    );
  }

  // Listar médicos
  listarMedicos() {
    return this.http.get<Medico[]>(
      `${this.apiUrl}/medicos`
    );
  }

  // Listar horarios del médico
  listarHorariosMedico(idMedico: number) {
    return this.http.get<Horario[]>(
      `${this.apiUrl}/horarios-medicos/medico/${idMedico}`
    );
  }

  // Listar citas del médico
  listarCitasMedico(idMedico: number) {
    return this.http.get<Cita[]>(
      `${this.apiUrl}/citas/medico/${idMedico}`
    );
  }

  // Registrar cita médica
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

  // Consultar citas del paciente
  listarCitasPaciente(idPersona: number) {
    return this.http.get<Cita[]>(
      `${this.apiUrl}/citas/paciente/${idPersona}`
    );
  }

  // Anular cita
  anularCita(idCita: number) {
    return this.http.patch<void>(
      `${this.apiUrl}/citas/${idCita}/anular`,
      {}
    );
  }

  // Reprogramar cita
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

  // RF-03: Consultar fondo estudiantil
  consultarFondo(codigoUniversitario: string) {
    return this.http.get<FondoEstudiantil>(
      `${this.apiUrl}/personas/fondo/${encodeURIComponent(codigoUniversitario)}`
    );
  }

}
